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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { package_id, listing_id, listing_type } = await req.json();

    console.log('Creating premium payment:', { package_id, listing_id, listing_type, user_id: user.id });

    // Get package info
    const { data: pkg, error: pkgError } = await supabaseClient
      .from('premium_packages')
      .select('*')
      .eq('id', package_id)
      .single();

    if (pkgError || !pkg) {
      throw new Error('Package not found');
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    // Convert XOF to EUR (approximately 1 EUR = 655.957 XOF)
    const priceInEur = Math.round((pkg.price / 655.957) * 100); // Convert to EUR cents
    
    console.log('Price calculation:', { 
      original_xof: pkg.price, 
      calculated_eur_cents: priceInEur,
      calculated_eur: priceInEur / 100
    });

    // Stripe requires a minimum amount of 50 cents
    if (priceInEur < 50) {
      throw new Error(`Amount too small for Stripe: ${priceInEur} cents (minimum is 50 cents)`);
    }
    
    // Get the webhook URL from environment or construct it
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/stripe-webhook`;
    
    console.log('Webhook URL:', webhookUrl);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Pack Premium: ${pkg.name}`,
              description: pkg.description || `Promotion de votre annonce pour ${pkg.duration_days} jours`,
            },
            unit_amount: priceInEur,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?listing_id=${listing_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/promote`,
      metadata: {
        user_id: user.id,
        package_id: package_id,
        listing_id: listing_id,
        listing_type: listing_type,
        payment_type: 'premium_listing'
      }
    });

    console.log('Stripe session created:', session.id);
    console.log('Session URL:', session.url);

    if (!session.url) {
      throw new Error('Stripe session created but no URL returned');
    }

    console.log('Returning response with URL');

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
