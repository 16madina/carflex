import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Vérifier l'utilisateur authentifié
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Non autorisé");
    }

    console.log("Planification de la suppression pour l'utilisateur:", user.id);

    // Récupérer le profil pour obtenir l'email
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single();

    // Marquer le compte pour suppression dans 30 jours
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        deletion_scheduled_at: deletionDate.toISOString()
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erreur lors de la planification de suppression:", updateError);
      throw updateError;
    }

    // Envoyer l'email de confirmation
    if (profile?.email) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CarFlex <contact@carflexapp.com>",
            to: [profile.email],
            subject: "Confirmation de suppression de votre compte CarFlex",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Suppression de compte planifiée</h2>
                <p>Bonjour ${profile.first_name || ""},</p>
                <p>Nous avons bien reçu votre demande de suppression de compte.</p>
                <p><strong>Votre compte sera définitivement supprimé le ${deletionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.</strong></p>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0;">
                  <h3 style="margin-top: 0; color: #dc2626;">Période de grâce de 30 jours</h3>
                  <p style="margin-bottom: 0;">Vous avez 30 jours pour changer d'avis. Pour annuler cette suppression, connectez-vous simplement à votre compte avant la date limite.</p>
                </div>

                <p><strong>Ce qui sera supprimé :</strong></p>
                <ul>
                  <li>Votre profil et informations personnelles</li>
                  <li>Toutes vos annonces de vente et de location</li>
                  <li>Vos messages et conversations</li>
                  <li>Vos favoris et réservations</li>
                  <li>Votre abonnement Pro (le cas échéant)</li>
                </ul>

                <p>Si vous avez des questions ou si cette suppression n'est pas volontaire, contactez-nous immédiatement.</p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                  Cordialement,<br>
                  L'équipe CarFlex
                </p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
        }

        console.log("Email de confirmation envoyé à:", profile.email);
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // Continue même si l'email échoue
      }
    }

    console.log("Suppression planifiée pour le:", deletionDate);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Votre compte sera supprimé dans 30 jours",
        deletion_date: deletionDate.toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur dans delete-account:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur serveur" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
