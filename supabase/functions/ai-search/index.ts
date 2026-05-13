import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

interface Filters {
  listing_type?: 'sale' | 'rental';
  brand?: string;
  model?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  max_mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  city?: string;
  country?: string;
}

const SYSTEM_PROMPT = `Tu es un assistant qui convertit des requêtes en langage naturel en filtres de recherche de véhicules pour CarFlex (Afrique de l'Ouest).
Réponds UNIQUEMENT en JSON valide qui matche ce schéma:
{
  "listing_type": "sale" | "rental" | null,
  "brand": string | null,
  "model": string | null,
  "min_price": number | null,
  "max_price": number | null,
  "min_year": number | null,
  "max_year": number | null,
  "max_mileage": number | null,
  "fuel_type": "gasoline" | "diesel" | "electric" | "hybrid" | null,
  "transmission": "automatic" | "manual" | null,
  "body_type": string | null,
  "city": string | null,
  "country": string | null,
  "summary": string
}
Règles:
- "louer", "location" => listing_type=rental, sinon "sale" par défaut.
- Prix en FCFA si non précisé. "10M" = 10000000.
- "essence"=gasoline, "diesel"=diesel, "électrique"=electric, "hybride"=hybrid.
- "auto"=automatic, "manuelle/mécanique"=manual.
- Mets null pour ce qui n'est pas mentionné.
- summary: phrase courte FR récapitulant la recherche.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'query requis' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call Lovable AI gateway
    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Limite atteinte, réessaie dans un instant.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'Crédits IA épuisés.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI error ${aiRes.status}: ${errText}`);
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || '{}';
    const filters: Filters & { summary?: string } = JSON.parse(raw);

    // Build query
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const table = filters.listing_type === 'rental' ? 'rental_listings' : 'sale_listings';
    const priceField = filters.listing_type === 'rental' ? 'price_per_day' : 'price';

    let q = supabase.from(table).select('*').limit(50);

    if (filters.brand) q = q.ilike('brand', `%${filters.brand}%`);
    if (filters.model) q = q.ilike('model', `%${filters.model}%`);
    if (filters.min_price) q = q.gte(priceField, filters.min_price);
    if (filters.max_price) q = q.lte(priceField, filters.max_price);
    if (filters.min_year) q = q.gte('year', filters.min_year);
    if (filters.max_year) q = q.lte('year', filters.max_year);
    if (filters.max_mileage) q = q.lte('mileage', filters.max_mileage);
    if (filters.fuel_type) q = q.eq('fuel_type', filters.fuel_type);
    if (filters.transmission) q = q.eq('transmission', filters.transmission);
    if (filters.body_type) q = q.ilike('body_type', `%${filters.body_type}%`);
    if (filters.city) q = q.ilike('city', `%${filters.city}%`);
    if (filters.country) q = q.ilike('country', `%${filters.country}%`);

    const { data: listings, error } = await q;
    if (error) throw error;

    return new Response(JSON.stringify({
      filters,
      summary: filters.summary || '',
      listing_type: filters.listing_type || 'sale',
      listings: listings || [],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('ai-search error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erreur' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
