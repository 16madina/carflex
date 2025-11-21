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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !data.user) {
      throw new Error("Non authentifié");
    }

    const user = data.user;
    console.log('[verify-ios-purchase] User authenticated:', user.id);

    const body = await req.json();
    const { purchase_type, package_id, listing_id, listing_type, product_id, transaction_id, customer_info } = body;

    console.log('[verify-ios-purchase] Request body:', { purchase_type, package_id, listing_id, listing_type, product_id });

    // Gérer les achats de packs premium pour annonces
    if (purchase_type === 'premium_listing') {
      console.log('[verify-ios-purchase] Processing premium listing purchase');

      // Vérifier si le premium n'est pas déjà activé
      const { data: existingPremium } = await supabaseAdmin
        .from("premium_listings")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listing_id)
        .eq("is_active", true)
        .single();

      if (existingPremium) {
        console.log('[verify-ios-purchase] Premium already active');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Premium déjà activé",
            already_active: true 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Récupérer le package pour obtenir la durée
      const { data: pkg, error: pkgError } = await supabaseAdmin
        .from("premium_packages")
        .select("duration_days")
        .eq("id", package_id)
        .single();

      if (pkgError || !pkg) {
        console.error('[verify-ios-purchase] Package not found:', pkgError);
        throw new Error("Package introuvable");
      }

      console.log('[verify-ios-purchase] Package found:', pkg);

      // Créer l'entrée premium_listings
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + pkg.duration_days);

      const { error: insertError } = await supabaseAdmin
        .from("premium_listings")
        .insert({
          user_id: user.id,
          listing_id: listing_id,
          listing_type: listing_type,
          package_id: package_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        });

      if (insertError) {
        console.error('[verify-ios-purchase] Error inserting premium_listings:', insertError);
        throw insertError;
      }

      console.log('[verify-ios-purchase] Premium listing created successfully');

      // Créer une notification pour l'utilisateur
      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        type: "premium_activated",
        title: "Promotion activée !",
        message: `Votre annonce est maintenant promue pour ${pkg.duration_days} jours.`,
        read: false,
      });

      console.log('[verify-ios-purchase] Notification created');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Premium activé avec succès",
          duration_days: pkg.duration_days
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Gérer les abonnements Pro (logique existante)
    console.log('[verify-ios-purchase] Processing subscription purchase');

    // Récupérer le plan Pro depuis subscription_plans
    const { data: proPlan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('name', 'Pro')
      .single();

    if (planError || !proPlan) {
      console.error('[verify-ios-purchase] Plan Pro not found:', planError);
      throw new Error("Plan Pro introuvable");
    }

    console.log('[verify-ios-purchase] Pro plan found:', proPlan.id);

    // Vérifier si l'abonnement existe déjà
    const { data: existingSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', proPlan.stripe_product_id)
      .single();

    // Calculer les dates d'abonnement
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Abonnement mensuel

    if (existingSubscription) {
      // Mettre à jour l'abonnement existant
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('[verify-ios-purchase] Error updating subscription:', updateError);
        throw updateError;
      }

      console.log('[verify-ios-purchase] Subscription updated successfully');
    } else {
      // Créer un nouvel abonnement
      const { error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          product_id: proPlan.stripe_product_id,
          status: 'active',
          current_period_end: endDate.toISOString()
        });

      if (insertError) {
        console.error('[verify-ios-purchase] Error creating subscription:', insertError);
        throw insertError;
      }

      console.log('[verify-ios-purchase] Subscription created successfully');
    }

    // Créer une notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
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
