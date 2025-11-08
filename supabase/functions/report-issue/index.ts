import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportIssueRequest {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, subject, message }: ReportIssueRequest = await req.json();

    // Send email to support
    const emailResponse = await resend.emails.send({
      from: "CarFlex Support <onboarding@resend.dev>",
      to: ["support@carflex.com"], // Replace with your actual support email
      replyTo: userEmail,
      subject: `Problème signalé: ${subject}`,
      html: `
        <h2>Nouveau problème signalé</h2>
        <p><strong>De:</strong> ${userName} (${userEmail})</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "CarFlex Support <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Nous avons reçu votre signalement",
      html: `
        <h2>Bonjour ${userName},</h2>
        <p>Merci d'avoir signalé ce problème. Nous avons bien reçu votre message et notre équipe vous répondra dans les plus brefs délais.</p>
        <p><strong>Votre message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p>Cordialement,<br>L'équipe CarFlex</p>
      `,
    });

    console.log("Issue report sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in report-issue function:", error);
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
