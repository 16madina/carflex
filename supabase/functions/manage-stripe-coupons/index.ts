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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non authentifié");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Non authentifié");
    }

    // Vérifier que l'utilisateur est admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Accès refusé - Admin uniquement");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { action, couponData, couponId } = await req.json();

    if (action === "list") {
      const coupons = await stripe.coupons.list({ limit: 100 });
      return new Response(JSON.stringify({ coupons: coupons.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const coupon = await stripe.coupons.create({
        name: couponData.code,
        duration: couponData.duration,
        percent_off: couponData.percentOff,
        amount_off: couponData.amountOff ? Math.round(couponData.amountOff * 100) : undefined,
        currency: couponData.amountOff ? "xof" : undefined,
        duration_in_months: couponData.duration === "repeating" ? couponData.durationInMonths : undefined,
      });

      return new Response(JSON.stringify({ coupon }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const deletedCoupon = await stripe.coupons.del(couponId);
      return new Response(JSON.stringify({ deleted: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Action non supportée");

  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur serveur" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
