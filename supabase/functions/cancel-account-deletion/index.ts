import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    console.log("Vérification de la suppression planifiée pour:", user.id);

    // Vérifier si le compte a une suppression planifiée
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("deletion_scheduled_at, deleted_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Si la suppression est planifiée et pas encore effectuée
    if (profile.deletion_scheduled_at && !profile.deleted_at) {
      console.log("Annulation de la suppression planifiée");

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          deletion_scheduled_at: null
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Suppression de compte annulée",
          was_scheduled: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Aucune suppression planifiée",
        was_scheduled: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur dans cancel-account-deletion:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur serveur" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
