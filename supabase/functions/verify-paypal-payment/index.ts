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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { order_id } = await req.json();
    console.log('Verifying PayPal payment:', { order_id, user_id: user.id });

    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");

    if (!paypalClientId || !paypalSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(paypalClientId, paypalSecret);

    // Get order details from PayPal
    const orderResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${order_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to get PayPal order details');
    }

    const orderData = await orderResponse.json();
    console.log('PayPal order status:', orderData.status);

    if (orderData.status !== 'APPROVED' && orderData.status !== 'COMPLETED') {
      throw new Error('Payment not completed');
    }

    // Capture the payment if it's only approved
    if (orderData.status === 'APPROVED') {
      const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${order_id}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!captureResponse.ok) {
        throw new Error('Failed to capture PayPal payment');
      }

      console.log('Payment captured successfully');
    }

    // Parse custom_id to get metadata
    const customId = orderData.purchase_units[0].custom_id;
    const metadata = JSON.parse(customId);

    console.log('Payment metadata:', metadata);

    // Verify user_id matches
    if (metadata.user_id !== user.id) {
      throw new Error('User ID mismatch');
    }

    // Check if premium listing already exists
    const { data: existingListing } = await supabaseAdmin
      .from('premium_listings')
      .select('id')
      .eq('user_id', metadata.user_id)
      .eq('listing_id', metadata.listing_id)
      .eq('is_active', true)
      .single();

    if (existingListing) {
      console.log('Premium listing already active');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Premium listing already active' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get package duration
    const { data: pkg } = await supabaseAdmin
      .from('premium_packages')
      .select('duration_days')
      .eq('id', metadata.package_id)
      .single();

    if (!pkg) {
      throw new Error('Package not found');
    }

    // Create premium listing
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.duration_days);

    const { error: insertError } = await supabaseAdmin
      .from('premium_listings')
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
      console.error('Error creating premium listing:', insertError);
      throw insertError;
    }

    // Create notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: metadata.user_id,
        title: 'Promotion activée',
        message: `Votre annonce a été promue avec succès pour ${pkg.duration_days} jours.`,
        type: 'premium',
      });

    console.log('Premium listing created successfully');

    return new Response(JSON.stringify({ 
      success: true,
      duration: pkg.duration_days 
    }), {
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
