import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to get PayPal access token
async function getPayPalAccessToken(clientId: string, secret: string) {
  const auth = btoa(`${clientId}:${secret}`);
  const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal token error:', error);
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

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

    console.log('Creating PayPal payment:', { package_id, listing_id, listing_type, user_id: user.id });

    // Get package info
    const { data: pkg, error: pkgError } = await supabaseClient
      .from('premium_packages')
      .select('*')
      .eq('id', package_id)
      .single();

    if (pkgError || !pkg) {
      throw new Error('Package not found');
    }

    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");

    if (!paypalClientId || !paypalSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(paypalClientId, paypalSecret);

    // Convert XOF to USD (approximately 1 USD = 600 XOF)
    const priceInUsd = (pkg.price / 600).toFixed(2);
    
    console.log('Price calculation:', { 
      original_xof: pkg.price, 
      calculated_usd: priceInUsd
    });

    // Create PayPal order
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: priceInUsd,
          },
          description: `Pack Premium: ${pkg.name}`,
          custom_id: JSON.stringify({
            user_id: user.id,
            package_id: package_id,
            listing_id: listing_id,
            listing_type: listing_type,
            payment_type: 'premium_listing'
          }),
        }],
        application_context: {
          return_url: `${origin}/payment-success?listing_id=${listing_id}`,
          cancel_url: `${origin}/promote`,
          brand_name: 'CarFlex',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal order error:', error);
      throw new Error('Failed to create PayPal order');
    }

    const orderData = await orderResponse.json();
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('PayPal approval URL not found');
    }

    console.log('PayPal order created:', orderData.id);
    console.log('Approval URL:', approvalUrl);

    return new Response(JSON.stringify({ url: approvalUrl, orderId: orderData.id }), {
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
