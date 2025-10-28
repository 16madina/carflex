import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://carflex.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) throw new Error("Utilisateur non authentifié");

    // Parse request body for optional coupon code and plan_id
    let couponCode, planId;
    try {
      const body = await req.json();
      couponCode = body?.coupon_code;
      planId = body?.plan_id;
    } catch {
      // No body provided, that's ok
      couponCode = null;
      planId = null;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get or create customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
    }

    // Get subscription plan price
    let priceId;
    if (planId) {
      const { data: plan } = await supabaseClient
        .from("subscription_plans")
        .select("stripe_price_id")
        .eq("id", planId)
        .single();
      
      if (!plan) throw new Error("Plan non trouvé");
      priceId = plan.stripe_price_id;
    } else {
      // Default to basic plan
      const { data: plan } = await supabaseClient
        .from("subscription_plans")
        .select("stripe_price_id")
        .eq("name", "Basic")
        .single();
      
      if (!plan) throw new Error("Plan par défaut non trouvé");
      priceId = plan.stripe_price_id;
    }

    const sessionConfig: any = {
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/subscription`,
      metadata: {
        user_id: user.id,
      },
    };

    // Add coupon if provided
    if (couponCode) {
      sessionConfig.discounts = [{ coupon: couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Une erreur est survenue" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
