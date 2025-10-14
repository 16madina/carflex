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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Non authentifié');
    }

    const { package_id, listing_id, listing_type } = await req.json();
    
    console.log('Initiation paiement:', { package_id, listing_id, listing_type, user_id: user.id });

    // Récupérer les infos du package
    const { data: pkg, error: pkgError } = await supabaseClient
      .from('premium_packages')
      .select('*')
      .eq('id', package_id)
      .single();

    if (pkgError || !pkg) {
      throw new Error('Package introuvable');
    }

    // Récupérer le profil utilisateur
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Créer la transaction Fedapay
    const fedapayResponse = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FEDAPAY_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Package Premium: ${pkg.name}`,
        amount: pkg.price,
        currency: {
          iso: 'XOF'
        },
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
        customer: {
          firstname: profile?.first_name || 'Client',
          lastname: profile?.last_name || 'CarFlex',
          email: profile?.email || user.email,
          phone_number: {
            number: profile?.phone || '',
            country: profile?.country || 'SN'
          }
        },
        custom_metadata: {
          user_id: user.id,
          package_id: package_id,
          listing_id: listing_id,
          listing_type: listing_type
        }
      })
    });

    if (!fedapayResponse.ok) {
      const errorText = await fedapayResponse.text();
      console.error('Erreur Fedapay:', errorText);
      throw new Error('Erreur lors de la création de la transaction');
    }

    const transaction = await fedapayResponse.json();
    console.log('Transaction créée:', transaction.v1.id);

    // Générer le token de paiement
    const tokenResponse = await fetch(`https://api.fedapay.com/v1/transactions/${transaction.v1.id}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FEDAPAY_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      }
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur génération token:', errorText);
      throw new Error('Erreur lors de la génération du token de paiement');
    }

    const tokenData = await tokenResponse.json();
    
    return new Response(
      JSON.stringify({
        transaction_id: transaction.v1.id,
        token: tokenData.v1.token,
        url: tokenData.v1.url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur:', error);
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
