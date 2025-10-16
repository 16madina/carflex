import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-STRIPE-PRICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      throw new Error("Unauthorized: Admin role required");
    }
    logStep("Admin verified");

    const { productId, oldPriceId, newAmount } = await req.json();
    
    if (!productId || !oldPriceId || !newAmount) {
      throw new Error("Product ID, old price ID, and new amount are required");
    }

    logStep("Creating new price", { productId, newAmount });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the old price to get its details
    const oldPrice = await stripe.prices.retrieve(oldPriceId);
    
    // Create new price with the new amount
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: newAmount,
      currency: oldPrice.currency,
      recurring: oldPrice.recurring ? {
        interval: oldPrice.recurring.interval,
      } : undefined,
      active: true,
    });

    logStep("New price created", { priceId: newPrice.id });

    // Deactivate old price
    await stripe.prices.update(oldPriceId, {
      active: false,
    });

    logStep("Old price deactivated", { priceId: oldPriceId });

    return new Response(JSON.stringify({
      success: true,
      newPriceId: newPrice.id,
      amount: newPrice.unit_amount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update-stripe-price", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
