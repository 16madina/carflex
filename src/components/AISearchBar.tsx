import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  onResults: (data: { listings: any[]; listing_type: "sale" | "rental"; summary: string }) => void;
}

const examples = [
  "SUV hybride sous 15M FCFA à Abidjan",
  "BMW automatique de moins de 100 000 km",
  "Voiture à louer à Dakar avec boîte auto",
];

const AISearchBar = ({ onResults }: Props) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-search", { body: { query: q } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onResults(data);
      toast({ title: "Recherche IA", description: data.summary || `${data.listings.length} résultat(s) trouvé(s)` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Recherche IA indisponible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            placeholder="Décris ce que tu cherches… (ex: SUV hybride sous 15M à Abidjan)"
            className="pl-10 text-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(query)}
            disabled={loading}
          />
        </div>
        <Button onClick={() => search(query)} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "IA"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => { setQuery(ex); search(ex); }}
            className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            disabled={loading}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISearchBar;
