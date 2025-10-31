import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://carflex.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    console.log("Webhook Stripe reçu");

    // Vérifier la signature du webhook (OBLIGATOIRE)
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      console.error("Signature ou secret webhook manquant");
      return new Response(
        JSON.stringify({ error: "Missing signature or webhook secret" }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Signature webhook vérifiée ✓");
    } catch (err) {
      console.error("Erreur de vérification de signature:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Type d'événement:", event.type);

    // Gérer les événements d'abonnement
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log("Abonnement:", subscription.id);
      console.log("Customer:", subscription.customer);
      console.log("Status:", subscription.status);
      console.log("Product:", subscription.items.data[0]?.price.product);

      // Récupérer l'utilisateur par customer ID
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", subscription.customer as string)
        .limit(1);

      if (!profiles || profiles.length === 0) {
        console.log("Utilisateur non trouvé, recherche par customer ID");
        // Si pas trouvé par email, on cherche dans user_subscriptions
        const { data: userSubs } = await supabaseAdmin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", subscription.customer as string)
          .limit(1);

        if (userSubs && userSubs.length > 0) {
          // Mettre à jour l'abonnement existant
          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
              stripe_subscription_id: subscription.id,
              product_id: subscription.items.data[0]?.price.product as string,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", subscription.customer as string);

          if (updateError) {
            console.error("Erreur mise à jour abonnement:", updateError);
          } else {
            console.log("Abonnement mis à jour avec succès");
          }
        }
      } else {
        // Créer ou mettre à jour l'abonnement
        const userId = profiles[0].id;
        
        const { error: upsertError } = await supabaseAdmin
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            product_id: subscription.items.data[0]?.price.product as string,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id"
          });

        if (upsertError) {
          console.error("Erreur upsert abonnement:", upsertError);
        } else {
          console.log("Abonnement créé/mis à jour avec succès");
          
          // Créer une notification
          if (subscription.status === "active") {
            await supabaseAdmin.from("notifications").insert({
              user_id: userId,
              type: "subscription",
              title: "Abonnement Pro activé !",
              message: "Votre abonnement Pro est maintenant actif. Profitez de tous les avantages premium !",
              read: false,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          received: true,
          message: "Abonnement traité avec succès" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Gérer la suppression d'abonnement
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log("Abonnement supprimé:", subscription.id);

      const { error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (updateError) {
        console.error("Erreur mise à jour statut:", updateError);
      } else {
        console.log("Statut d'abonnement mis à jour");
      }

      return new Response(
        JSON.stringify({ 
          received: true,
          message: "Annulation traitée" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Traiter les paiements réussis pour les promotions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Session complétée:", session.id);
      console.log("Metadata:", session.metadata);

      const metadata = session.metadata;

      // Si c'est un abonnement, il sera géré par customer.subscription.created
      if (session.mode === "subscription") {
        console.log("Session d'abonnement, sera géré par customer.subscription.created");
        return new Response(
          JSON.stringify({ received: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Sinon, c'est une promotion d'annonce
      if (!metadata || !metadata.user_id || !metadata.package_id || !metadata.listing_id) {
        console.log("Pas de métadonnées de promotion, ignorer");
        return new Response(
          JSON.stringify({ received: true }),
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
        .eq("id", metadata.package_id)
        .single();

      if (pkgError || !pkg) {
        console.error("Erreur récupération package:", pkgError);
        throw new Error("Package introuvable");
      }

      console.log("Package trouvé:", pkg);

      // Créer l'entrée premium_listings
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + pkg.duration_days);

      const { error: insertError } = await supabaseAdmin
        .from("premium_listings")
        .insert({
          user_id: metadata.user_id,
          listing_id: metadata.listing_id,
          listing_type: metadata.listing_type,
          package_id: metadata.package_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        });

      if (insertError) {
        console.error("Erreur insertion premium_listings:", insertError);
        throw insertError;
      }

      console.log("Premium listing créé avec succès");

      // Créer une notification pour l'utilisateur
      await supabaseAdmin.from("notifications").insert({
        user_id: metadata.user_id,
        type: "premium_activated",
        title: "Promotion activée !",
        message: `Votre annonce est maintenant promue pour ${pkg.duration_days} jours.`,
        read: false,
      });

      console.log("Notification créée");

      return new Response(
        JSON.stringify({ 
          received: true,
          message: "Paiement traité avec succès" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Autres types d'événements
    console.log("Événement non géré:", event.type);
    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erreur webhook Stripe:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
