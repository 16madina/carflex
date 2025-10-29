import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    logStep("Function started");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("En-tête d'autorisation manquant");
    }
    
    logStep("Authenticating user");
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("ERROR: Authentication failed", { error: authError.message });
      throw new Error(`Erreur d'authentification: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: No user email");
      throw new Error("Utilisateur non authentifié ou email manquant");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body for coupon code and plan_id
    logStep("Parsing request body");
    let couponCode, planId;
    try {
      const body = await req.json();
      couponCode = body?.coupon_code;
      planId = body?.plan_id;
      logStep("Request body parsed", { couponCode: couponCode || 'none', planId: planId || 'none' });
    } catch (e) {
      logStep("No body provided or invalid JSON");
      couponCode = null;
      planId = null;
    }
    
    if (!planId) {
      logStep("ERROR: No plan_id provided");
      throw new Error("Le plan_id est requis");
    }

    logStep("Initializing Stripe");
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get or create customer
    logStep("Checking for existing Stripe customer");
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
      logStep("Found existing customer", { customerId: customer.id });
    } else {
      logStep("Creating new Stripe customer");
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      logStep("Customer created", { customerId: customer.id });
    }

    // Get subscription plan price
    logStep("Fetching subscription plan", { planId });
    const { data: plan, error: planError } = await supabaseClient
      .from("subscription_plans")
      .select("stripe_price_id, name, price, is_active")
      .eq("id", planId)
      .single();
    
    if (planError) {
      logStep("ERROR: Database error fetching plan", { error: planError.message });
      throw new Error(`Erreur lors de la récupération du plan: ${planError.message}`);
    }
    
    if (!plan) {
      logStep("ERROR: Plan not found", { planId });
      throw new Error("Plan d'abonnement non trouvé");
    }
    
    if (!plan.is_active) {
      logStep("ERROR: Plan is inactive", { planId });
      throw new Error("Ce plan d'abonnement n'est plus actif");
    }
    
    const priceId = plan.stripe_price_id;
    logStep("Plan found", { planName: plan.name, priceId, price: plan.price });

    logStep("Creating Stripe checkout session");
    const origin = req.headers.get("origin") || "https://carflex.lovable.app";
    
    const sessionConfig: any = {
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    };

    // Add coupon if provided
    if (couponCode) {
      logStep("Applying coupon code", { couponCode });
      sessionConfig.discounts = [{ coupon: couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    logStep("ERROR in create-checkout", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
