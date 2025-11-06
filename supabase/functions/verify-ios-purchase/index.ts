import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Non authentifié");
    }

    const { transaction_id, product_id, customer_info } = await req.json();

    console.log('[verify-ios-purchase] Processing purchase:', {
      user_id: userData.user.id,
      transaction_id,
      product_id
    });

    // Vérifier si l'abonnement existe déjà
    const { data: existingSubscription } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('platform', 'ios')
      .single();

    // Calculer les dates d'abonnement
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Abonnement mensuel

    // Récupérer le plan Pro depuis subscription_plans
    const { data: proPlan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('name', 'Pro')
      .single();

    if (planError || !proPlan) {
      throw new Error("Plan Pro introuvable");
    }

    if (existingSubscription) {
      // Mettre à jour l'abonnement existant
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
          transaction_id
        })
        .eq('id', existingSubscription.id);

      if (updateError) throw updateError;
    } else {
      // Créer un nouvel abonnement
      const { error: insertError } = await supabaseClient
        .from('user_subscriptions')
        .insert({
          user_id: userData.user.id,
          plan_id: proPlan.id,
          status: 'active',
          platform: 'ios',
          transaction_id,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString()
        });

      if (insertError) throw insertError;
    }

    // Créer une notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userData.user.id,
        title: "Abonnement Pro activé",
        message: "Votre abonnement Pro a été activé avec succès !",
        type: 'subscription'
      });

    console.log('[verify-ios-purchase] Abonnement activé avec succès');

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription_end: endDate.toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[verify-ios-purchase] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
