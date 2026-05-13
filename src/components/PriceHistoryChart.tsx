import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useCountry } from "@/contexts/CountryContext";

interface Props {
  listingId: string;
  listingType: "sale" | "rental";
  currentPrice: number;
}

interface Row {
  created_at: string;
  new_price: number;
  old_price: number | null;
}

const PriceHistoryChart = ({ listingId, listingType, currentPrice }: Props) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCountry();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("price_history")
        .select("created_at,new_price,old_price")
        .eq("listing_id", listingId)
        .eq("listing_type", listingType)
        .order("created_at", { ascending: true });
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
  }, [listingId, listingType]);

  if (loading || rows.length < 2) return null;

  const first = Number(rows[0].new_price);
  const diff = currentPrice - first;
  const pct = first > 0 ? (diff / first) * 100 : 0;
  const isDrop = diff < 0;

  const data = rows.map((r) => ({
    date: new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    price: Number(r.new_price),
  }));

  return (
    <Card className="p-4 bg-background/70 backdrop-blur-xl border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Évolution du prix</h3>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isDrop ? "text-green-600" : diff > 0 ? "text-destructive" : "text-muted-foreground"
        }`}>
          {isDrop ? <TrendingDown className="h-4 w-4" /> : diff > 0 ? <TrendingUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          {diff !== 0 && (
            <span>
              {isDrop ? "-" : "+"}{Math.abs(pct).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(v: number) => formatPrice(v)}
            />
            <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PriceHistoryChart;
