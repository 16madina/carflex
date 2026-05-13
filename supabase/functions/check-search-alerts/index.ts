import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: alerts, error: alertsError } = await supabase
      .from("search_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsError) throw alertsError;

    let totalNotifications = 0;

    for (const alert of alerts || []) {
      const tableName = alert.listing_type === "rental" ? "rental_listings" : "sale_listings";
      const priceField = alert.listing_type === "rental" ? "price_per_day" : "price";

      let query = supabase
        .from(tableName)
        .select("id, brand, model, year, " + priceField + ", city, country")
        .gt("created_at", alert.last_checked_at);

      if (alert.brand) query = query.ilike("brand", alert.brand);
      if (alert.model) query = query.ilike("model", `%${alert.model}%`);
      if (alert.min_price) query = query.gte(priceField, alert.min_price);
      if (alert.max_price) query = query.lte(priceField, alert.max_price);
      if (alert.min_year) query = query.gte("year", alert.min_year);
      if (alert.max_year) query = query.lte("year", alert.max_year);
      if (alert.max_mileage) query = query.lte("mileage", alert.max_mileage);
      if (alert.fuel_type) query = query.eq("fuel_type", alert.fuel_type);
      if (alert.transmission) query = query.eq("transmission", alert.transmission);
      if (alert.body_type) query = query.eq("body_type", alert.body_type);
      if (alert.country) query = query.eq("country", alert.country);
      if (alert.city) query = query.ilike("city", `%${alert.city}%`);

      const { data: matches, error: matchError } = await query.limit(20);
      if (matchError) {
        console.error("Match error for alert", alert.id, matchError);
        continue;
      }

      if (matches && matches.length > 0) {
        const linkPath = alert.listing_type === "rental" ? "rental" : "listing";
        for (const m of matches) {
          await supabase.from("notifications").insert({
            user_id: alert.user_id,
            title: `🔔 Nouveau véhicule pour "${alert.name}"`,
            message: `${m.brand} ${m.model} ${m.year} - ${Number(m[priceField]).toLocaleString()} XOF (${m.city})`,
            type: "search_alert",
          });
          totalNotifications++;
        }

        // Optional push
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              user_id: alert.user_id,
              title: `🔔 ${matches.length} nouveau(x) véhicule(s)`,
              body: `Pour votre alerte "${alert.name}"`,
              data: { type: "search_alert", alert_id: alert.id, link: `/${linkPath}/${matches[0].id}` },
            },
          });
        } catch (e) {
          console.error("Push error:", e);
        }
      }

      await supabase
        .from("search_alerts")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", alert.id);
    }

    return new Response(
      JSON.stringify({ success: true, alerts_checked: alerts?.length || 0, notifications_created: totalNotifications }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("check-search-alerts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
