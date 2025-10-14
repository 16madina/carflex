import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PremiumPackage {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  features: any;
  is_active: boolean | null;
}

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<PremiumPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_days: 30,
    price: 0,
    features: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions d'administrateur",
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      setIsAdmin(true);
      fetchPackages();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("premium_packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les packages",
        variant: "destructive",
      });
      return;
    }

    setPackages(data as PremiumPackage[] || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const packageData = {
      name: formData.name,
      description: formData.description,
      duration_days: formData.duration_days,
      price: formData.price,
      features: formData.features.split("\n").filter(f => f.trim()),
      is_active: true,
    };

    if (editingPackage) {
      const { error } = await supabase
        .from("premium_packages")
        .update(packageData)
        .eq("id", editingPackage.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le package",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Package mis à jour avec succès" });
    } else {
      const { error } = await supabase
        .from("premium_packages")
        .insert([packageData]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le package",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Package créé avec succès" });
    }

    setFormData({ name: "", description: "", duration_days: 30, price: 0, features: "" });
    setEditingPackage(null);
    fetchPackages();
  };

  const handleEdit = (pkg: PremiumPackage) => {
    setEditingPackage(pkg);
    const featuresArray = Array.isArray(pkg.features) ? pkg.features : [];
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      duration_days: pkg.duration_days,
      price: pkg.price,
      features: featuresArray.join("\n"),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce package ?")) return;

    const { error } = await supabase
      .from("premium_packages")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le package",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Package supprimé avec succès" });
    fetchPackages();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Chargement...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingPackage ? "Modifier" : "Créer"} un Package Premium</CardTitle>
              <CardDescription>
                Gérez les offres premium pour les annonces sponsorisées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du package</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Durée (jours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Prix (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="features">Fonctionnalités (une par ligne)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Mise en avant sur la page d'accueil&#10;Badge Premium&#10;Position prioritaire"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPackage ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingPackage ? "Mettre à jour" : "Créer"}
                  </Button>
                  {editingPackage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingPackage(null);
                        setFormData({ name: "", description: "", duration_days: 30, price: 0, features: "" });
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Packages Existants</h2>
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Durée:</strong> {pkg.duration_days} jours</p>
                    <p><strong>Prix:</strong> {pkg.price}€</p>
                    {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                      <div>
                        <strong>Fonctionnalités:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {pkg.features.map((feature: string, idx: number) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AdminPanel;
