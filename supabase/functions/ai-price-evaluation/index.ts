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

    // Get similar vehicles for market analysis - try exact match first
    let { data: similarVehicles } = await supabase
      .from(tableName)
      .select("*")
      .eq("brand", listing.brand)
      .eq("model", listing.model)
      .neq("id", listingId)
      .limit(50);

    // If not enough exact matches, expand search to same brand with similar year/mileage
    if (!similarVehicles || similarVehicles.length < 5) {
      const yearRange = 3; // +/- 3 years
      const { data: expandedResults } = await supabase
        .from(tableName)
        .select("*")
        .eq("brand", listing.brand)
        .gte("year", listing.year - yearRange)
        .lte("year", listing.year + yearRange)
        .neq("id", listingId)
        .limit(30);
      
      similarVehicles = expandedResults || similarVehicles || [];
    }

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

    const prompt = `En tant qu'expert automobile du marché ouest-africain, analyse ce véhicule et son prix:

VÉHICULE À ÉVALUER:
- Marque/Modèle: ${listing.brand} ${listing.model}
- Année: ${listing.year} (${vehicleAge} ans, âge important pour la dépréciation)
- Kilométrage: ${listing.mileage.toLocaleString()} km
- Prix demandé: ${priceValue.toLocaleString()} XOF
- Carburant: ${listing.fuel_type}
- Transmission: ${listing.transmission}
- Type: ${listing.body_type || 'Non spécifié'}
- État: ${listing.condition || 'Utilisé'}

DONNÉES DU MARCHÉ (${marketData.count} véhicules similaires analysés):
- Prix moyen du marché: ${marketData.average.toLocaleString()} XOF
- Fourchette: ${marketData.min.toLocaleString()} - ${marketData.max.toLocaleString()} XOF
- Année moyenne: ${marketData.avgYear}
- Kilométrage moyen: ${marketData.avgMileage.toLocaleString()} km

CONTEXTE MARCHÉ OUEST-AFRICAIN:
- Les véhicules de moins de 5 ans avec faible kilométrage (<80k km) se vendent généralement à prix premium
- Les véhicules diesel et automatiques ont plus de valeur
- La dépréciation est d'environ 8-12% par an
- Un kilométrage supérieur à 150k km réduit significativement la valeur

CONSIGNES D'ÉVALUATION:
1. Compare le prix demandé au prix moyen du marché ajusté selon l'âge et le kilométrage
2. Si véhicule récent (<5 ans) avec faible kilométrage, considère que c'est normal d'être proche ou au-dessus du marché
3. Si véhicule ancien (>8 ans) ou fort kilométrage (>150k), le prix devrait être en dessous du marché
4. Catégorie: "excellent_prix" (15%+ économie), "bon_prix" (5-15% économie), "prix_correct" (-5% à +5%), "prix_eleve" (>5% surcoût)
5. Pourcentage: positif = économie, négatif = surcoût par rapport au marché ajusté

Réponds UNIQUEMENT en JSON (sans markdown, sans commentaire):
{
  "category": "bon_prix",
  "savingsPercentage": 12,
  "explanation": "Explication claire en français",
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
