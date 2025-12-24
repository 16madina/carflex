import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Crown, Sparkles, TrendingUp, BarChart3, Tag, ArrowLeft, RefreshCw } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { storeKitService } from "@/services/storekit";

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
  const [promoCode, setPromoCode] = useState(""); // Web/Android uniquement
  const [showPromoInput, setShowPromoInput] = useState(false); // Web/Android uniquement
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // ID du produit IAP configuré dans App Store Connect (v2 car l'ancien ID a été supprimé)
  const IOS_PRODUCT_ID = "com.missdee.carflextest.pro.monthly.v2";
  
  // Initialiser StoreKit pour iOS
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsIOS(platform === 'ios');
    
    if (platform === 'ios') {
      initializeStoreKit();
    }
  }, []);

  const initializeStoreKit = async () => {
    try {
      await storeKitService.initialize();
      console.log('[StoreKit] Service initialisé');
    } catch (error) {
      console.error('[StoreKit] Erreur initialisation:', error);
    }
  };

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
      // Sur iOS, utiliser les achats in-app natifs
      if (isIOS) {
        await handleIOSPurchase();
      } else {
        // Sur web/Android, utiliser Stripe
        await handleStripePurchase();
      }
    } catch (error: any) {
      console.error('[Subscription] Erreur lors de l\'achat:', error?.message);
      
      // Ne pas afficher de toast si c'est une annulation (déjà géré dans handleIOSPurchase)
      if (error.message !== 'CANCELLED') {
        toast({
          title: "Erreur de paiement",
          description: error.message || "Impossible de traiter le paiement. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleIOSPurchase = async () => {
    try {
      console.log('[StoreKit] Démarrage de l\'achat pour:', IOS_PRODUCT_ID);
      
      if (!storeKitService.isAvailable()) {
        console.error('[StoreKit] Service not available');
        toast({
          title: "Service indisponible",
          description: "StoreKit n'est pas disponible. Veuillez tester sur un appareil iOS réel.",
          variant: "destructive"
        });
        throw new Error("StoreKit non disponible");
      }

      // Achat natif iOS via StoreKit
      // Note: Les codes promo doivent être appliqués via l'App Store, pas dans l'app
      toast({
        title: "Ouverture App Store...",
        description: "Préparation du paiement Apple",
      });
      
      const purchasePromise = storeKitService.purchase(IOS_PRODUCT_ID);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => {
          console.error('[StoreKit] Purchase timeout after 30 seconds');
          reject(new Error('Le paiement n\'a pas répondu. Vérifiez vos achats dans Réglages > App Store et réessayez.'));
        }, 30000)
      );
      
      console.log('[StoreKit] Waiting for purchase or timeout...');
      const purchaseResult = await Promise.race([purchasePromise, timeoutPromise]);
      
      console.log('[StoreKit] Achat réussi:', purchaseResult);

      toast({
        title: "Validation en cours...",
        description: "Vérification de votre achat avec le serveur",
      });

      await syncIOSPurchase(purchaseResult);
      await refreshSubscription();

      toast({
        title: "🎉 Abonnement activé !",
        description: "Votre plan Pro est maintenant actif. Profitez de tous les avantages premium !",
      });

    } catch (error: any) {
      // Gestion des erreurs d'achat
      if (error.message === 'CANCELLED') {
        toast({
          title: "Achat annulé",
          description: "Vous pouvez réessayer quand vous voulez",
        });
        throw new Error("CANCELLED");
      }
      
      // Pour les autres erreurs, afficher un message spécifique
      if (error.message?.includes('identifiant du produit') || error.message?.includes('purchase identifier')) {
        toast({
          title: "Produit invalide",
          description: "L'identifiant du produit est invalide. Contactez le support.",
          variant: "destructive"
        });
      } else if (error.message?.includes('pas autorisés') || error.message?.includes('not allowed')) {
        toast({
          title: "Achats désactivés",
          description: "Les achats ne sont pas autorisés sur cet appareil. Vérifiez vos réglages iOS.",
          variant: "destructive"
        });
      } else if (error.message?.includes('pas disponible') || error.message?.includes('not available')) {
        toast({
          title: "Produit indisponible",
          description: "Ce produit n'est pas disponible. Assurez-vous d'être sur un appareil iOS réel.",
          variant: "destructive"
        });
      } else if (error.message?.includes('réseau') || error.message?.includes('network')) {
        toast({
          title: "Problème de connexion",
          description: "Vérifiez votre connexion internet et réessayez",
          variant: "destructive"
        });
      } else if (error.message?.includes('Accès refusé') || error.message?.includes('permission')) {
        toast({
          title: "Accès refusé",
          description: "Veuillez autoriser l'accès aux informations iCloud dans les réglages iOS",
          variant: "destructive"
        });
      } else if (error.message?.includes('synchronisation') || error.message?.includes('sync')) {
        toast({
          title: "Erreur de vérification",
          description: "L'achat a réussi mais la vérification a échoué. Essayez 'Restaurer les achats' ou contactez le support.",
          variant: "destructive"
        });
      } else if (error.message?.includes('Sandbox') || error.message?.includes('test')) {
        toast({
          title: "Mode Test détecté",
          description: "Compte de test Apple détecté. La validation est en cours de traitement.",
          variant: "destructive"
        });
      } else if (!error.message?.includes('CANCELLED')) {
        // Erreur générique avec le message d'erreur
        toast({
          title: "Erreur d'achat",
          description: error.message || "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive"
        });
      }
      
      throw error;
    }
  };

  const handleStripePurchase = async () => {
    try {
      // Prix Stripe pour le Plan Pro mensuel (10,000 XOF/mois)
      const STRIPE_PRICE_ID = 'price_1SO66N0uNiBPsOk0hWzYsLTW';
      
      console.log('[STRIPE] Création de la session de paiement...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: STRIPE_PRICE_ID,
          ...(promoCode && { couponCode: promoCode })
        }
      });
      
      if (error) {
        console.error('[STRIPE] Erreur:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('[STRIPE] Ouverture de la session de paiement');
        // Ouvrir dans un nouvel onglet pour faciliter le test
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirection vers le paiement",
          description: "Une nouvelle fenêtre s'est ouverte pour effectuer le paiement",
        });
      }
    } catch (error: any) {
      console.error('[STRIPE] Erreur complète:', error);
      throw new Error(error.message || "Erreur lors de la création de la session de paiement");
    }
  };

  // Helper pour retry avec backoff exponentiel côté frontend
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Ne pas retry certaines erreurs permanentes
        const errorMsg = error.message?.toLowerCase() || '';
        const isNotRetryable = 
          errorMsg.includes('cancelled') ||
          errorMsg.includes('annulé') ||
          errorMsg.includes('session expirée') ||
          errorMsg.includes('configuration') ||
          errorMsg.includes('bundle');
        
        if (isNotRetryable || attempt === maxRetries) {
          throw error;
        }
        
        const delayMs = initialDelay * Math.pow(2, attempt);
        console.log(`[Retry] Tentative ${attempt + 1}/${maxRetries} échouée, retry dans ${delayMs}ms...`);
        
        // Afficher un toast informatif lors des retries
        if (attempt > 0) {
          toast({
            title: "Nouvelle tentative...",
            description: `Tentative ${attempt + 1}/${maxRetries + 1} en cours`,
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw lastError;
  };

  const syncIOSPurchase = async (purchaseResult: any) => {
    try {
      // Wrapper avec retry automatique
      await retryWithBackoff(async () => {
        // Envoyer le reçu au backend pour validation
        const { data, error } = await supabase.functions.invoke('verify-ios-purchase', {
          body: {
            transaction_id: purchaseResult.transactionId,
            product_id: purchaseResult.productId,
            purchase_date: purchaseResult.purchaseDate.toISOString(),
            original_transaction_id: purchaseResult.originalTransactionId
          }
        });

        if (error) {
          console.error('[StoreKit] Erreur sync:', error);
          
          // Messages d'erreur spécifiques en français
          const errorMsg = error.message?.toLowerCase() || '';
          
          if (errorMsg.includes('21007') || errorMsg.includes('sandbox')) {
            throw new Error('Erreur de validation : reçu de test détecté. Contactez le support si le problème persiste.');
          }
          if (errorMsg.includes('bundle') || errorMsg.includes('invalid')) {
            throw new Error('Erreur de configuration de l\'application. Contactez le support.');
          }
          if (errorMsg.includes('transaction') || errorMsg.includes('not found')) {
            throw new Error('Transaction introuvable. Réessayez ou restaurez vos achats.');
          }
          if (errorMsg.includes('auth') || errorMsg.includes('non authentifié')) {
            throw new Error('Session expirée. Reconnectez-vous et réessayez.');
          }
          
          throw new Error('Erreur de synchronisation : ' + (error.message || 'Veuillez réessayer'));
        }

        // Vérifier aussi si data contient une erreur
        if (data?.error) {
          throw new Error(data.user_message || data.error);
        }

        console.log('[StoreKit] Achat synchronisé avec succès');
      }, 3, 1000); // 3 retries, délai initial de 1 seconde
      
    } catch (error: any) {
      console.error('[StoreKit] Erreur finale après tous les retries:', error);
      
      // Message spécifique si on a atteint la limite de retries
      if (error.message?.includes('retry')) {
        toast({
          title: "Serveurs Apple surchargés",
          description: "Réessayez dans quelques minutes ou restaurez vos achats.",
          variant: "destructive"
        });
      }
      
      throw error; // Propager l'erreur
    }
  };

  const handleManageSubscription = async () => {
    setManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        console.log('[Subscription] Opening customer portal:', data.url);
        window.location.href = data.url;
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

  const handleRestorePurchases = async () => {
    if (!isIOS) return;
    
    setRestoring(true);
    
    try {
      console.log('[StoreKit] Démarrage de la restauration...');
      
      if (!storeKitService.isAvailable()) {
        toast({
          title: "Service indisponible",
          description: "StoreKit n'est pas disponible. Veuillez tester sur un appareil iOS réel.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Restauration en cours...",
        description: "Recherche de vos achats précédents",
      });
      
      const restoredPurchases = await storeKitService.restorePurchases();
      
      console.log('[StoreKit] Achats restaurés:', restoredPurchases.length);
      
      if (restoredPurchases.length === 0) {
        toast({
          title: "Aucun achat trouvé",
          description: "Aucun abonnement n'a été trouvé pour ce compte Apple",
        });
        return;
      }
      
      // Vérifier chaque achat restauré avec le backend (avec retry automatique)
      toast({
        title: "Validation en cours...",
        description: `Vérification de ${restoredPurchases.length} achat(s) avec retry automatique`,
      });
      
      let successCount = 0;
      for (const purchase of restoredPurchases) {
        try {
          await syncIOSPurchase(purchase); // Utilise déjà le retry automatique
          successCount++;
        } catch (error) {
          console.error('[StoreKit] Erreur sync achat restauré:', error);
        }
      }
      
      // Rafraîchir le statut d'abonnement
      await refreshSubscription();
      
      if (successCount > 0) {
        toast({
          title: "✅ Achats restaurés avec succès !",
          description: `${successCount} abonnement(s) restauré(s). Votre compte a été mis à jour.`,
        });
      } else {
        toast({
          title: "Erreur de restauration",
          description: "Impossible de vérifier les achats restaurés. Contactez le support.",
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      console.error('[StoreKit] Erreur restauration:', error);
      
      toast({
        title: "Erreur de restauration",
        description: error.message || "Impossible de restaurer les achats. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setRestoring(false);
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

        {/* Informations requises par Apple pour les abonnements auto-renouvelables (Guideline 3.1.2) */}
        {isIOS && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border text-sm">
            <p className="font-semibold mb-2">Abonnement CarFlex Pro</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Durée : Mensuel (renouvellement automatique)</li>
              <li>• Prix : 10 000 XOF/mois</li>
              <li>• Le paiement sera débité sur votre compte iTunes à la confirmation de l'achat</li>
              <li>• L'abonnement se renouvelle automatiquement sauf annulation au moins 24h avant la fin de la période en cours</li>
              <li>• Gérez vos abonnements dans les Réglages de votre compte Apple</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs">
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Politique de confidentialité
              </Link>
              <Link to="/terms-of-service" className="text-primary hover:underline">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        )}

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
                  {/* Codes promo uniquement pour Web/Android (Stripe) */}
                  {!isIOS && (
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
                  )}

                  <Button
                    onClick={handleSubscribe} 
                    disabled={subscribing || restoring}
                    className="w-full"
                    size="lg"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isIOS ? "Ouverture App Store..." : "Redirection vers Stripe..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Passer à Pro
                      </>
                    )}
                  </Button>
                  
                  {isIOS && (
                    <Button
                      onClick={handleRestorePurchases}
                      disabled={subscribing || restoring}
                      variant="outline"
                      className="w-full"
                    >
                      {restoring ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Restauration...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restaurer mes achats
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-2">
                  {subscriptionEnd && (
                    <p className="text-sm text-muted-foreground text-center">
                      Renouvelé le {new Date(subscriptionEnd).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {!isIOS && (
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
                  )}
                  
                  {isIOS && (
                    <Button
                      onClick={handleRestorePurchases}
                      disabled={restoring}
                      variant="outline"
                      className="w-full"
                    >
                      {restoring ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Restauration...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restaurer mes achats
                        </>
                      )}
                    </Button>
                  )}
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
