import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, context } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured, skipping AI moderation");
      return new Response(
        JSON.stringify({ approved: true, reason: "AI moderation disabled" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const systemPrompt = `Tu es un modérateur de contenu pour une plateforme de vente et location de véhicules.
Analyse le texte suivant et détermine s'il contient du contenu inapproprié, des arnaques, du spam, du harcèlement ou des informations fausses.

Réponds UNIQUEMENT avec un JSON valide au format suivant :
{
  "approved": true/false,
  "reason": "explication courte"
}

Critères de rejet :
- Langage offensant, insultes, propos haineux
- Arnaques évidentes (prix irréalistes, demandes de paiement urgentes)
- Spam (répétition excessive, liens suspects)
- Harcèlement ou menaces
- Informations manifestement fausses ou trompeuses
- Coordonnées personnelles sensibles (numéros de carte bancaire, etc.)

Contexte : ${context || 'Annonce de véhicule'}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      // En cas d'erreur, on approuve par défaut pour ne pas bloquer l'utilisateur
      return new Response(
        JSON.stringify({ approved: true, reason: "AI moderation error, content approved by default" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;

    // Extract JSON from AI response
    let result;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // En cas d'erreur de parsing, on approuve par défaut
      return new Response(
        JSON.stringify({ approved: true, reason: "AI response parsing error, content approved by default" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in moderate-content:", error);
    // En cas d'erreur, on approuve par défaut pour ne pas bloquer l'utilisateur
    return new Response(
      JSON.stringify({ approved: true, reason: "Moderation error, content approved by default" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
