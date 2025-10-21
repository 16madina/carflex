import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
      } else {
        // En développement, parser directement (pas recommandé en production)
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error("Erreur de vérification de signature:", err);
      return new Response(JSON.stringify({ error: "Signature invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Type d'événement:", event.type);

    // Traiter uniquement les paiements réussis
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Session complétée:", session.id);
      console.log("Metadata:", session.metadata);

      const metadata = session.metadata;

      if (!metadata || !metadata.user_id || !metadata.package_id || !metadata.listing_id) {
        throw new Error("Métadonnées manquantes dans la session Stripe");
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
