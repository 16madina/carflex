import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Crown, Sparkles, TrendingUp, BarChart3, Tag, ArrowLeft } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_product_id: string;
  stripe_price_id: string;
  price: number;
  currency: string;
  description: string | null;
  features: string[];
  display_order: number;
}

const FREE_FEATURES = [
  "Jusqu'à 5 annonces",
  "Fonctionnalités de base",
  "Support standard"
];

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, productId, subscriptionEnd, loading, refreshSubscription } = useSubscription();
  const [subscribing, setSubscribing] = useState(false);
  const [managing, setManaging] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Charger les plans depuis la base de données
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        // Convertir features de Json vers string[]
        const formattedPlans = (data || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features as string[] : []
        }));
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les plans d'abonnement",
          variant: "destructive"
        });
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const proPlan = plans.find(plan => plan.name === 'Pro');
  const isPro = subscribed && proPlan && productId === proPlan.stripe_product_id;

  const handleSubscribe = async () => {
    if (!proPlan) {
      toast({
        title: "Erreur",
        description: "Le plan Pro n'est pas disponible",
        variant: "destructive"
      });
      return;
    }

    setSubscribing(true);
    try {
      const body: any = { plan_id: proPlan.id };
      if (promoCode) {
        body.coupon_code = promoCode;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du checkout:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la session de paiement. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    setManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ouverture du portail client:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail de gestion. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setManaging(false);
    }
  };

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <main className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Choisissez votre plan</h1>
          <p className="text-muted-foreground">
            Augmentez vos ventes avec un abonnement premium
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Plan Gratuit */}
          <Card className={!isPro ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gratuit</CardTitle>
                {!isPro && <Badge>Plan actuel</Badge>}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold">0 XOF</span>
                <span className="text-muted-foreground">/mois</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {FREE_FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Plan Pro - Chargé depuis la base de données */}
          {proPlan && (
            <Card className={isPro ? "border-primary bg-gradient-to-br from-primary/5 to-transparent" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{proPlan.name}</CardTitle>
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  {isPro && <Badge className="bg-primary">Plan actuel</Badge>}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">{formatPrice(proPlan.price)}</span>
                  <span className="text-muted-foreground">/mois</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {proPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {!isPro ? (
                <div className="w-full space-y-3">
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPromoInput(!showPromoInput)}
                      className="w-full"
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      {showPromoInput ? "Masquer" : "Ajouter"} un code promo
                    </Button>
                    
                    {showPromoInput && (
                      <Input
                        placeholder="Code promo (optionnel)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      />
                    )}
                  </div>

                  <Button 
                    onClick={handleSubscribe} 
                    disabled={subscribing}
                    className="w-full"
                    size="lg"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Passer à Pro
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-2">
                  {subscriptionEnd && (
                    <p className="text-sm text-muted-foreground text-center">
                      Renouvelé le {new Date(subscriptionEnd).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  <Button 
                    onClick={handleManageSubscription} 
                    disabled={managing}
                    variant="outline"
                    className="w-full"
                  >
                    {managing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      "Gérer mon abonnement"
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
          )}
        </div>

        {/* Avantages du plan Pro */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Visibilité maximale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vos annonces apparaissent en premier dans les résultats de recherche
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Crown className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Badge Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Un badge "Pro" distinctif sur toutes vos annonces pour gagner en crédibilité
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Statistiques avancées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Suivez les performances de vos annonces avec des analyses détaillées
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Subscription;
