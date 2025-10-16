import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  userId: string;
  email: string;
  firstName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, firstName }: VerificationEmailRequest = await req.json();
    console.log("Sending verification email to:", email);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours

    // Store token in database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_token: token,
        verification_token_expires: expiresAt.toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error storing verification token:", updateError);
      throw updateError;
    }

    // Create verification link
    const verificationLink = `https://carflex.lovable.app/verify-email?verify=${token}`;

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LaZone <noreply@carflexapp.com>",
        to: [email],
        subject: "Vérifiez votre adresse email - LaZone",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚗 Bienvenue sur LaZone!</h1>
              </div>
              <div class="content">
                <p>Bonjour ${firstName},</p>
                <p>Merci de vous être inscrit sur LaZone, la plateforme de confiance pour l'achat et la location de véhicules en Afrique de l'Ouest!</p>
                <p>Pour activer votre badge vérifié ✓ et profiter pleinement de toutes les fonctionnalités, veuillez cliquer sur le bouton ci-dessous:</p>
                <center>
                  <a href="${verificationLink}" class="button">Vérifier mon email</a>
                </center>
                <p style="color: #666; font-size: 14px;">Ce lien est valide pendant 24 heures. Si vous n'avez pas créé de compte sur LaZone, vous pouvez ignorer cet email.</p>
                <p>À bientôt sur LaZone!</p>
                <p style="margin-top: 30px;">L'équipe LaZone</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} LaZone. Tous droits réservés.</p>
                <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email:", error);
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
