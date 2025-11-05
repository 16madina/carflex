import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { content_type, content_id, reason, description } = await req.json();

    // Validate input
    const validContentTypes = ['sale_listing', 'rental_listing', 'user', 'message'];
    const validReasons = ['inappropriate', 'scam', 'spam', 'harassment', 'fake', 'other'];

    if (!validContentTypes.includes(content_type)) {
      throw new Error("Invalid content type");
    }

    if (!validReasons.includes(reason)) {
      throw new Error("Invalid reason");
    }

    if (!content_id) {
      throw new Error("Content ID is required");
    }

    // Insert report
    const { data, error } = await supabaseClient
      .from('reported_content')
      .insert({
        reporter_id: user.id,
        content_type,
        content_id,
        reason,
        description: description || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating report:", error);
      throw error;
    }

    // Create notification for admins
    const { data: admins } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.user_id,
        title: 'Nouveau signalement',
        message: `Un utilisateur a signalé un contenu pour : ${reason}`,
        type: 'admin',
        read: false
      }));

      await supabaseClient
        .from('notifications')
        .insert(notifications);
    }

    return new Response(
      JSON.stringify({ success: true, report: data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in report-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
