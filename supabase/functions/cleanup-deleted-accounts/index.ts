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
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log("Recherche des comptes à supprimer définitivement...");

    // Trouver les comptes dont la période de grâce est expirée
    const { data: expiredAccounts, error: fetchError } = await supabaseClient
      .from("profiles")
      .select("id, email, first_name, last_name, deletion_scheduled_at")
      .not("deletion_scheduled_at", "is", null)
      .is("deleted_at", null)
      .lt("deletion_scheduled_at", new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredAccounts || expiredAccounts.length === 0) {
      console.log("Aucun compte à supprimer");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Aucun compte à supprimer",
          deleted_count: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`${expiredAccounts.length} compte(s) à supprimer`);

    let deletedCount = 0;
    const errors = [];

    // Supprimer chaque compte expiré
    for (const account of expiredAccounts) {
      try {
        console.log(`Suppression du compte: ${account.id} (${account.email})`);

        // Supprimer l'utilisateur de auth
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
          account.id
        );

        if (deleteError) {
          throw deleteError;
        }

        // Marquer comme supprimé dans profiles (au cas où la cascade ne fonctionne pas)
        await supabaseClient
          .from("profiles")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", account.id);

        deletedCount++;
        console.log(`✓ Compte supprimé: ${account.email}`);
      } catch (error) {
        console.error(`✗ Erreur lors de la suppression de ${account.email}:`, error);
        errors.push({
          user_id: account.id,
          email: account.email,
          error: error instanceof Error ? error.message : "Erreur inconnue"
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${deletedCount} compte(s) supprimé(s)`,
        deleted_count: deletedCount,
        total_found: expiredAccounts.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur dans cleanup-deleted-accounts:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur serveur",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
