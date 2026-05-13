import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompare } from "@/hooks/useCompare";
import { useCountry } from "@/contexts/CountryContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";

const Compare = () => {
  const { items, remove, clear } = useCompare();
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (items.length === 0) { setData([]); setLoading(false); return; }
      setLoading(true);
      const results: any[] = [];
      for (const it of items) {
        const table = it.type === "rental" ? "rental_listings" : "sale_listings";
        const { data: row } = await supabase.from(table).select("*").eq("id", it.id).maybeSingle();
        if (row) results.push({ ...row, _type: it.type });
      }
      setData(results);
      setLoading(false);
    })();
  }, [items]);

  const rows: { label: string; key: (l: any) => any }[] = [
    { label: "Prix", key: (l) => l._type === "rental" ? `${formatPrice(l.price_per_day)}/jour` : formatPrice(l.price) },
    { label: "Année", key: (l) => l.year },
    { label: "Kilométrage", key: (l) => `${(l.mileage || 0).toLocaleString()} km` },
    { label: "Carburant", key: (l) => l.fuel_type },
    { label: "Boîte", key: (l) => l.transmission === "automatic" ? "Automatique" : "Manuelle" },
    { label: "Carrosserie", key: (l) => l.body_type || "—" },
    { label: "Ville", key: (l) => l.city },
    { label: "Pays", key: (l) => l.country },
    { label: "Équipements", key: (l) => Array.isArray(l.features) ? l.features.length : 0 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-[calc(4rem+max(1rem,env(safe-area-inset-top)))]">
      <Seo title="Comparateur de véhicules — CarFlex" description="Comparez 2 ou 3 véhicules côte à côte." path="/compare" />
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <h1 className="text-xl font-bold text-foreground">Comparateur</h1>
          {data.length > 0 && (
            <Button variant="ghost" onClick={clear}>Vider</Button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Chargement…</p>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aucun véhicule à comparer.</p>
            <Button onClick={() => navigate("/listings")}>Parcourir les annonces</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid gap-4" style={{ gridTemplateColumns: `120px repeat(${data.length}, minmax(180px, 1fr))` }}>
              <div />
              {data.map((l) => (
                <Card key={l.id} className="p-3 relative bg-background/70 backdrop-blur-xl">
                  <button
                    onClick={() => remove(l.id, l._type)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                    aria-label="Retirer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {Array.isArray(l.images) && l.images[0] && (
                    <img src={l.images[0] as string} alt={`${l.brand} ${l.model}`} className="w-full h-24 object-cover rounded-md mb-2" />
                  )}
                  <p className="font-bold text-sm text-foreground">{l.brand} {l.model}</p>
                  <button
                    onClick={() => navigate(l._type === "rental" ? `/rental/${l.id}` : `/listing/${l.id}`)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Voir l'annonce
                  </button>
                </Card>
              ))}

              {rows.map((r) => (
                <>
                  <div key={`${r.label}-l`} className="text-sm font-medium text-muted-foreground py-3 border-t border-border">{r.label}</div>
                  {data.map((l) => (
                    <div key={`${r.label}-${l.id}`} className="text-sm text-foreground py-3 border-t border-border">
                      {r.key(l)}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Compare;
