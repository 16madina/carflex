import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { listingId, listingType = "sale" } = await req.json();

    if (!listingId) {
      return new Response(
        JSON.stringify({ error: "listingId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the listing details
    const tableName = listingType === "sale" ? "sale_listings" : "rental_listings";
    const priceField = listingType === "sale" ? "price" : "price_per_day";
    
    const { data: listing, error: listingError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: "Listing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get similar vehicles (same brand and model)
    const { data: similarVehicles } = await supabase
      .from(tableName)
      .select(priceField)
      .eq("brand", listing.brand)
      .eq("model", listing.model)
      .neq("id", listingId)
      .limit(20);

    let dealRating: "excellent" | "good" | "fair" | "poor" = "fair";
    let savingsPercentage = 0;
    let marketAverage = 0;
    let explanation = "";

    if (similarVehicles && similarVehicles.length >= 3) {
      // Calculate market average
      const prices = similarVehicles.map((v: any) => v[priceField] || 0);
      marketAverage = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
      
      // Adjust for age (newer cars should be more expensive)
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - listing.year;
      const ageMultiplier = Math.max(0.7, 1 - (vehicleAge * 0.03)); // 3% depreciation per year
      
      // Adjust for mileage (higher mileage = lower price)
      const avgMileagePerYear = 15000;
      const expectedMileage = vehicleAge * avgMileagePerYear;
      const mileageDiff = listing.mileage - expectedMileage;
      const mileageAdjustment = (mileageDiff / 100000) * 0.1; // 10% adjustment per 100k km difference
      
      const adjustedMarketAverage = marketAverage * ageMultiplier * (1 - mileageAdjustment);
      
      // Calculate price difference
      const priceDiff = adjustedMarketAverage - listing[priceField];
      savingsPercentage = Math.round((priceDiff / adjustedMarketAverage) * 100);

      // Determine deal rating with more nuanced thresholds
      if (savingsPercentage >= 15) {
        dealRating = "excellent";
        explanation = `Ce véhicule est ${savingsPercentage}% moins cher que le prix moyen du marché. Excellente affaire!`;
      } else if (savingsPercentage >= 8) {
        dealRating = "good";
        explanation = `Ce véhicule est ${savingsPercentage}% moins cher que le prix moyen du marché. Bon prix!`;
      } else if (savingsPercentage >= -5) {
        dealRating = "fair";
        explanation = savingsPercentage > 0 
          ? `Ce véhicule est ${savingsPercentage}% moins cher que le marché. Prix négociable.`
          : `Ce véhicule est proche du prix du marché. Prix négociable.`;
      } else {
        dealRating = "poor";
        explanation = `Ce véhicule est ${Math.abs(savingsPercentage)}% plus cher que le prix moyen du marché.`;
      }
    } else {
      explanation = "Pas assez de données pour évaluer le prix du marché.";
    }

    return new Response(
      JSON.stringify({
        dealRating,
        savingsPercentage,
        marketAverage: Math.round(marketAverage),
        explanation,
        comparableCount: similarVehicles?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calculating deal rating:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
