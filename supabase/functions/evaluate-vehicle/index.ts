import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, year, mileage, condition, country, city } = await req.json();
    
    console.log('Evaluating vehicle:', { brand, model, year, mileage, condition, country, city });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Generate vehicle image
    const imagePrompt = `A professional, high-quality photograph of a ${year} ${brand} ${model} car in ${condition} condition. The car should be shown from a 3/4 front angle in a clean, modern showroom setting with good lighting. Photorealistic style.`;
    
    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    let vehicleImage = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      vehicleImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    }

    const prompt = `Tu es un expert en évaluation de véhicules. Analyse le véhicule suivant et fournis une estimation de prix détaillée basée sur les données du marché:

Véhicule:
- Marque: ${brand}
- Modèle: ${model}
- Année: ${year}
- Kilométrage: ${mileage} km
- État: ${condition}
- Localisation: ${city}, ${country}

Fournis une évaluation détaillée incluant:
1. Une fourchette de prix estimée en devise locale
2. Les facteurs qui influencent le prix (état du marché local, demande, dépréciation)
3. Des recommandations pour la vente ou l'achat
4. Comparaison avec des véhicules similaires dans la région

Sois précis et professionnel dans ton analyse.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en évaluation automobile qui fournit des estimations de prix précises et détaillées basées sur les conditions du marché local.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes dépassée. Veuillez réessayer plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Paiement requis. Veuillez ajouter des crédits à votre espace de travail Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI Gateway error');
    }

    const data = await response.json();
    const evaluation = data.choices?.[0]?.message?.content;

    if (!evaluation) {
      throw new Error('No evaluation received from AI');
    }

    console.log('Evaluation completed successfully');

    return new Response(
      JSON.stringify({ evaluation, vehicleImage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in evaluate-vehicle function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Une erreur est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
