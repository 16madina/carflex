import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { listingId, listingType = "sale" } = await req.json();

    if (!listingId) {
      return new Response(
        JSON.stringify({ error: "listingId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the listing details
    const tableName = listingType === "sale" ? "sale_listings" : "rental_listings";
    const priceField = listingType === "sale" ? "price" : "price_per_day";
    
    const { data: listing, error: listingError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: "Listing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get similar vehicles for market analysis
    const { data: similarVehicles } = await supabase
      .from(tableName)
      .select("*")
      .eq("brand", listing.brand)
      .eq("model", listing.model)
      .neq("id", listingId)
      .limit(50);

    // Calculate basic market stats
    let marketData = {
      average: 0,
      min: 0,
      max: 0,
      count: 0,
      avgYear: 0,
      avgMileage: 0
    };

    if (similarVehicles && similarVehicles.length > 0) {
      const prices = similarVehicles.map((v: any) => v[priceField] || 0);
      const years = similarVehicles.map((v: any) => v.year || 0);
      const mileages = similarVehicles.map((v: any) => v.mileage || 0);
      
      marketData = {
        average: Math.round(prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length),
        min: Math.min(...prices),
        max: Math.max(...prices),
        count: similarVehicles.length,
        avgYear: Math.round(years.reduce((sum: number, y: number) => sum + y, 0) / years.length),
        avgMileage: Math.round(mileages.reduce((sum: number, m: number) => sum + m, 0) / mileages.length)
      };
    }

    // Prepare context for AI analysis
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - listing.year;
    const priceValue = listing[priceField];

    const prompt = `En tant qu'expert automobile, analyse ce véhicule et son prix par rapport au marché:

Véhicule à évaluer:
- Marque/Modèle: ${listing.brand} ${listing.model}
- Année: ${listing.year} (${vehicleAge} ans)
- Kilométrage: ${listing.mileage.toLocaleString()} km
- Prix demandé: ${priceValue.toLocaleString()} XOF
- Carburant: ${listing.fuel_type}
- Transmission: ${listing.transmission}
- Type de carrosserie: ${listing.body_type || 'Non spécifié'}
- État: ${listing.condition || 'Non spécifié'}

Données du marché (${marketData.count} véhicules similaires):
- Prix moyen: ${marketData.average.toLocaleString()} XOF
- Fourchette de prix: ${marketData.min.toLocaleString()} - ${marketData.max.toLocaleString()} XOF
- Année moyenne: ${marketData.avgYear}
- Kilométrage moyen: ${marketData.avgMileage.toLocaleString()} km

Fournis une évaluation structurée avec:
1. Une catégorie de prix parmi: "excellent_prix", "bon_prix", "prix_correct", "prix_eleve", "bonne_affaire"
2. Un pourcentage d'économie ou de surcoût (nombre positif si bon prix, négatif si trop cher)
3. Une explication courte (1-2 phrases) en français, claire et convaincante
4. Une recommandation d'action (acheter_rapidement, bon_choix, negocier, attention)

Prends en compte:
- L'âge du véhicule et sa dépréciation
- Le kilométrage par rapport à la moyenne
- Les caractéristiques spéciales (carburant, transmission, etc.)
- L'état général si mentionné

Réponds UNIQUEMENT au format JSON suivant (sans markdown):
{
  "category": "excellent_prix",
  "savingsPercentage": 15,
  "explanation": "Explication courte ici",
  "recommendation": "acheter_rapidement"
}`;

    console.log("Calling Lovable AI for vehicle evaluation...");

    // Call Lovable AI for intelligent analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Tu es un expert automobile spécialisé dans l'évaluation de prix de véhicules sur le marché ouest-africain. Tu fournis des analyses précises et objectives."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Paiement requis. Veuillez ajouter des crédits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content || "";
    
    console.log("AI response:", aiContent);

    // Parse AI response
    let evaluation;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      evaluation = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Fallback to basic calculation
      const priceDiff = marketData.average - priceValue;
      const savingsPercentage = marketData.average > 0 
        ? Math.round((priceDiff / marketData.average) * 100)
        : 0;
      
      evaluation = {
        category: savingsPercentage >= 15 ? "excellent_prix" : 
                  savingsPercentage >= 8 ? "bon_prix" : 
                  savingsPercentage >= -5 ? "prix_correct" : "prix_eleve",
        savingsPercentage: savingsPercentage,
        explanation: savingsPercentage >= 0 
          ? `Ce véhicule est ${savingsPercentage}% moins cher que la moyenne du marché.`
          : `Ce véhicule est ${Math.abs(savingsPercentage)}% plus cher que la moyenne du marché.`,
        recommendation: savingsPercentage >= 15 ? "acheter_rapidement" : 
                        savingsPercentage >= 8 ? "bon_choix" : 
                        savingsPercentage >= -5 ? "negocier" : "attention"
      };
    }

    // Map category to rating
    const categoryToRating: Record<string, string> = {
      "excellent_prix": "excellent",
      "bonne_affaire": "excellent",
      "bon_prix": "good",
      "prix_correct": "fair",
      "prix_eleve": "poor"
    };

    const dealRating = categoryToRating[evaluation.category] || "fair";

    return new Response(
      JSON.stringify({
        dealRating,
        savingsPercentage: evaluation.savingsPercentage,
        marketAverage: marketData.average,
        explanation: evaluation.explanation,
        recommendation: evaluation.recommendation,
        comparableCount: marketData.count,
        aiPowered: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-price-evaluation:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Impossible d'évaluer le véhicule pour le moment"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
