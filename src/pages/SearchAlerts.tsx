import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, Bell } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  name: string;
  listing_type: string;
  brand: string | null;
  model: string | null;
  min_price: number | null;
  max_price: number | null;
  min_year: number | null;
  max_year: number | null;
  max_mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  city: string | null;
  is_active: boolean;
}

const empty = {
  name: "",
  listing_type: "sale",
  brand: "",
  model: "",
  min_price: "",
  max_price: "",
  min_year: "",
  max_year: "",
  max_mileage: "",
  fuel_type: "any",
  transmission: "any",
  city: "",
};

const SearchAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("search_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erreur de chargement");
    setAlerts((data as Alert[]) || []);
    setLoading(false);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Donne un nom à l'alerte"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const payload: any = {
      user_id: user.id,
      name: form.name.trim(),
      listing_type: form.listing_type,
      brand: form.brand || null,
      model: form.model || null,
      min_price: form.min_price ? Number(form.min_price) : null,
      max_price: form.max_price ? Number(form.max_price) : null,
      min_year: form.min_year ? Number(form.min_year) : null,
      max_year: form.max_year ? Number(form.max_year) : null,
      max_mileage: form.max_mileage ? Number(form.max_mileage) : null,
      fuel_type: form.fuel_type !== "any" ? form.fuel_type : null,
      transmission: form.transmission !== "any" ? form.transmission : null,
      city: form.city || null,
    };

    const { error } = await supabase.from("search_alerts").insert(payload);
    setSaving(false);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Alerte créée 🔔");
    setForm(empty);
    setDialogOpen(false);
    load();
  };

  const toggle = async (id: string, value: boolean) => {
    const { error } = await supabase.from("search_alerts").update({ is_active: value }).eq("id", id);
    if (error) toast.error("Erreur");
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("search_alerts").delete().eq("id", id);
    if (error) toast.error("Erreur");
    else { toast.success("Alerte supprimée"); load(); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Seo title="Mes alertes de recherche | CarFlex" description="Recevez une notification dès qu'un véhicule correspondant à vos critères est publié." />
      <TopBar />

      <div className="container max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Mes alertes
            </h1>
            <p className="text-sm text-muted-foreground">Soyez notifié dès qu'un véhicule correspond à vos critères.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nouvelle</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Créer une alerte</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nom de l'alerte *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: BMW Série 3 < 10M XOF" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.listing_type} onValueChange={v => setForm({ ...form, listing_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Vente</SelectItem>
                      <SelectItem value="rental">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Marque</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="BMW" /></div>
                  <div><Label>Modèle</Label><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Série 3" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Prix min</Label><Input type="number" value={form.min_price} onChange={e => setForm({ ...form, min_price: e.target.value })} /></div>
                  <div><Label>Prix max</Label><Input type="number" value={form.max_price} onChange={e => setForm({ ...form, max_price: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Année min</Label><Input type="number" value={form.min_year} onChange={e => setForm({ ...form, min_year: e.target.value })} /></div>
                  <div><Label>Année max</Label><Input type="number" value={form.max_year} onChange={e => setForm({ ...form, max_year: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Kilométrage max</Label>
                  <Input type="number" value={form.max_mileage} onChange={e => setForm({ ...form, max_mileage: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Carburant</Label>
                    <Select value={form.fuel_type} onValueChange={v => setForm({ ...form, fuel_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Tous</SelectItem>
                        <SelectItem value="gasoline">Essence</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Électrique</SelectItem>
                        <SelectItem value="hybrid">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Transmission</Label>
                    <Select value={form.transmission} onValueChange={v => setForm({ ...form, transmission: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Toutes</SelectItem>
                        <SelectItem value="manual">Manuelle</SelectItem>
                        <SelectItem value="automatic">Automatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Ville</Label>
                  <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Dakar" />
                </div>
                <Button className="w-full" onClick={save} disabled={saving}>
                  {saving ? "Création..." : "Créer l'alerte"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Chargement...</p>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Aucune alerte pour le moment.</p>
              <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Créer ma première alerte</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base">{a.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch checked={a.is_active} onCheckedChange={(v) => toggle(a.id, v)} />
                      <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>{a.listing_type === "rental" ? "Location" : "Vente"} • {[a.brand, a.model].filter(Boolean).join(" ") || "Toutes marques"}</p>
                  {(a.min_price || a.max_price) && (
                    <p>Prix: {a.min_price?.toLocaleString() || 0} - {a.max_price?.toLocaleString() || "∞"} XOF</p>
                  )}
                  {(a.min_year || a.max_year) && (
                    <p>Année: {a.min_year || "—"} → {a.max_year || "—"}</p>
                  )}
                  {a.city && <p>Ville: {a.city}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default SearchAlerts;
