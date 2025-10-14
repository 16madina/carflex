import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Webhook reçu:', payload);

    // Vérifier que le paiement est approuvé
    if (payload.entity?.status !== 'approved') {
      console.log('Paiement non approuvé:', payload.entity?.status);
      return new Response(JSON.stringify({ message: 'Paiement non approuvé' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const metadata = payload.entity?.custom_metadata;
    
    if (!metadata || !metadata.user_id || !metadata.package_id || !metadata.listing_id) {
      throw new Error('Métadonnées manquantes');
    }

    // Récupérer le package pour obtenir la durée
    const { data: pkg } = await supabaseAdmin
      .from('premium_packages')
      .select('duration_days')
      .eq('id', metadata.package_id)
      .single();

    if (!pkg) {
      throw new Error('Package introuvable');
    }

    // Créer l'entrée premium_listings
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.duration_days);

    const { error: insertError } = await supabaseAdmin
      .from('premium_listings')
      .insert({
        user_id: metadata.user_id,
        listing_id: metadata.listing_id,
        listing_type: metadata.listing_type,
        package_id: metadata.package_id,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        is_active: true
      });

    if (insertError) {
      console.error('Erreur insertion:', insertError);
      throw insertError;
    }

    // Créer une notification pour l'utilisateur
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: metadata.user_id,
        type: 'premium_activated',
        title: 'Promotion activée !',
        message: `Votre annonce est maintenant promue pour ${pkg.duration_days} jours.`,
        read: false
      });

    console.log('Premium activé avec succès pour:', metadata.listing_id);

    return new Response(
      JSON.stringify({ message: 'Paiement traité avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
