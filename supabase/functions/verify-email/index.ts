import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyEmailRequest = await req.json();
    console.log("Verifying token:", token);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find profile with this token
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (fetchError || !profile) {
      console.error("Token not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(profile.verification_token_expires);
    const now = new Date();

    if (now > expiresAt) {
      console.error("Token expired");
      return new Response(
        JSON.stringify({ error: "Ce lien de vérification a expiré" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    console.log("Email verified successfully for user:", profile.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Votre email a été vérifié avec succès!" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
