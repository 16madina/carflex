import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Session ID manquant");
    }

    console.log("Vérification de la session Stripe:", session_id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log("Session récupérée:", {
      id: session.id,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    if (session.payment_status !== "paid") {
      throw new Error("Le paiement n'est pas encore complété");
    }

    const metadata = session.metadata;

    if (!metadata || !metadata.user_id || !metadata.package_id || !metadata.listing_id) {
      throw new Error("Métadonnées manquantes dans la session");
    }

    // Vérifier si le premium n'est pas déjà activé
    const { data: existingPremium } = await supabaseAdmin
      .from("premium_listings")
      .select("id")
      .eq("user_id", metadata.user_id)
      .eq("listing_id", metadata.listing_id)
      .eq("is_active", true)
      .single();

    if (existingPremium) {
      console.log("Premium déjà activé");
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
        success: true, 
        message: "Premium activé avec succès",
        duration_days: pkg.duration_days
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erreur vérification paiement:", error);
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
