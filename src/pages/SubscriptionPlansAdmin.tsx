import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_product_id: string;
  stripe_price_id: string;
  price: number;
  currency: string;
  description: string | null;
  features: string[];
  is_active: boolean;
  display_order: number;
}

const SubscriptionPlansAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features as string[] : []
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          stripe_product_id: editingPlan.stripe_product_id,
          stripe_price_id: editingPlan.stripe_price_id,
          price: editingPlan.price,
          currency: editingPlan.currency,
          description: editingPlan.description,
          features: editingPlan.features,
          is_active: editingPlan.is_active,
          display_order: editingPlan.display_order
        })
        .eq('id', editingPlan.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Plan mis à jour avec succès"
      });

      await fetchPlans();
      setEditingPlan(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFeatures = (value: string) => {
    if (!editingPlan) return;
    const featuresArray = value.split('\n').filter(f => f.trim());
    setEditingPlan({ ...editingPlan, features: featuresArray });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au panel admin
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des plans d'abonnement</h1>
          <p className="text-muted-foreground">
            Modifiez les prix, price_id Stripe et fonctionnalités de vos plans
          </p>
        </div>

        <div className="grid gap-6">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.description || "Aucune description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingPlan?.id === plan.id ? (
                  // Mode édition
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prix (en {editingPlan.currency.toUpperCase()})</Label>
                        <Input
                          type="number"
                          value={editingPlan.price}
                          onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Devise</Label>
                        <Input
                          value={editingPlan.currency}
                          onChange={(e) => setEditingPlan({ ...editingPlan, currency: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Stripe Product ID</Label>
                      <Input
                        value={editingPlan.stripe_product_id}
                        onChange={(e) => setEditingPlan({ ...editingPlan, stripe_product_id: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Stripe Price ID</Label>
                      <Input
                        value={editingPlan.stripe_price_id}
                        onChange={(e) => setEditingPlan({ ...editingPlan, stripe_price_id: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={editingPlan.description || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Fonctionnalités (une par ligne)</Label>
                      <Textarea
                        rows={6}
                        value={editingPlan.features.join('\n')}
                        onChange={(e) => updateFeatures(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingPlan.is_active}
                        onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                      />
                      <Label>Plan actif</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingPlan(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Prix:</span> {plan.price} {plan.currency.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold">Statut:</span>{' '}
                        <span className={plan.is_active ? "text-green-600" : "text-red-600"}>
                          {plan.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-semibold">Product ID:</span> {plan.stripe_product_id}
                    </div>

                    <div className="text-sm">
                      <span className="font-semibold">Price ID:</span> {plan.stripe_price_id}
                    </div>

                    <div>
                      <span className="font-semibold text-sm">Fonctionnalités:</span>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <Button onClick={() => setEditingPlan(plan)}>
                      Modifier
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SubscriptionPlansAdmin;
