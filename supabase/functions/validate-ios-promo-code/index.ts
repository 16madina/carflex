import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PromoCodeRequest {
  promoCode: string;
  productId: string;
  applicationUsername: string;
}

interface PromoCodeValidation {
  isValid: boolean;
  offerIdentifier?: string;
  keyIdentifier?: string;
  nonce?: string;
  signature?: string;
  timestamp?: number;
  error?: string;
}

// Generate a random UUID v4 for nonce
function generateNonce(): string {
  return crypto.randomUUID().toLowerCase();
}

// Generate signature for Apple Promotional Offer
async function generateSignature(
  keyIdentifier: string,
  privateKey: string,
  productIdentifier: string,
  offerIdentifier: string,
  applicationUsername: string,
  nonce: string,
  timestamp: number
): Promise<string> {
  try {
    // Import the private key
    const pemKey = privateKey
      .replace(/\\n/g, '\n')
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .trim();

    // Decode base64 to binary
    const binaryKey = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));

    // Import the key for signing
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["sign"]
    );

    // Create the payload to sign
    const payload = `${productIdentifier}\u2063${offerIdentifier}\u2063${applicationUsername}\u2063${nonce}\u2063${timestamp}`;
    
    // Convert payload to UTF-8 bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    // Sign the payload
    const signature = await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      cryptoKey,
      data
    );

    // Convert signature to base64
    const signatureArray = new Uint8Array(signature);
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

    return signatureBase64;
  } catch (error) {
    console.error("Error generating signature:", error);
    throw new Error(`Failed to generate signature: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { promoCode, productId, applicationUsername }: PromoCodeRequest = await req.json();

    if (!promoCode || !productId || !applicationUsername) {
      throw new Error('Missing required parameters');
    }

    console.log(`Validating promo code: ${promoCode} for product: ${productId}`);

    // Get Apple subscription key credentials from secrets
    const keyIdentifier = Deno.env.get('APPLE_SUBSCRIPTION_KEY_ID');
    const privateKey = Deno.env.get('APPLE_SUBSCRIPTION_PRIVATE_KEY');

    if (!keyIdentifier || !privateKey) {
      throw new Error('Apple subscription credentials not configured');
    }

    // Validate promo code in database
    // For now, we'll use a simple validation - you should add a promo_codes table
    // to store valid codes and their associated offer identifiers
    
    // Example: Check if promo code exists and is valid
    const { data: promoData, error: promoError } = await supabaseClient
      .from('ios_promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (promoError || !promoData) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Code promo invalide ou expiré',
        } as PromoCodeValidation),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate nonce and timestamp
    const nonce = generateNonce();
    const timestamp = Date.now();

    // Generate signature
    const signature = await generateSignature(
      keyIdentifier,
      privateKey,
      productId,
      promoData.offer_identifier,
      applicationUsername,
      nonce,
      timestamp
    );

    const response: PromoCodeValidation = {
      isValid: true,
      offerIdentifier: promoData.offer_identifier,
      keyIdentifier,
      nonce,
      signature,
      timestamp,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        isValid: false,
        error: error.message,
      } as PromoCodeValidation),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});