import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestDriveRequest {
  id: string;
  listing_id: string;
  listing_type: string;
  requester_id: string;
  seller_id: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { record } = await req.json() as { record: TestDriveRequest };

    console.log("Processing test drive request:", record.id);

    // Fetch seller profile
    const { data: seller, error: sellerError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", record.seller_id)
      .single();

    if (sellerError || !seller?.email) {
      console.error("Error fetching seller:", sellerError);
      throw new Error("Seller not found or has no email");
    }

    // Fetch requester profile
    const { data: requester, error: requesterError } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", record.requester_id)
      .single();

    if (requesterError) {
      console.error("Error fetching requester:", requesterError);
      throw new Error("Requester not found");
    }

    // Fetch vehicle details
    const table = record.listing_type === "sale" ? "sale_listings" : "rental_listings";
    const { data: vehicle, error: vehicleError } = await supabase
      .from(table)
      .select("brand, model")
      .eq("id", record.listing_id)
      .single();

    if (vehicleError) {
      console.error("Error fetching vehicle:", vehicleError);
      throw new Error("Vehicle not found");
    }

    const vehicleName = `${vehicle.brand} ${vehicle.model}`;
    const requesterName = `${requester.first_name} ${requester.last_name}`;
    const formattedDate = new Date(record.preferred_date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send email to seller
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CarFlex <contact@carflexapp.com>",
        to: [seller.email],
        subject: `Nouvelle demande d'essai pour votre ${vehicleName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nouvelle demande d'essai</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Détails de la demande</h3>
              <p><strong>Véhicule :</strong> ${vehicleName}</p>
              <p><strong>Demandeur :</strong> ${requesterName}</p>
              ${requester.phone ? `<p><strong>Téléphone :</strong> ${requester.phone}</p>` : ""}
              <p><strong>Date souhaitée :</strong> ${formattedDate}</p>
              <p><strong>Heure souhaitée :</strong> ${record.preferred_time}</p>
              ${record.message ? `<p><strong>Message :</strong><br/>${record.message}</p>` : ""}
            </div>

            <p style="color: #666;">
              Connectez-vous à votre compte CarFlex pour approuver ou refuser cette demande.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Cet email a été envoyé automatiquement par CarFlex.
              </p>
            </div>
          </div>
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
      JSON.stringify({ success: true, emailData }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-test-drive-request function:", error);
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
