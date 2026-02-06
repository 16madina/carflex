import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Crown, Sparkles, TrendingUp, BarChart3, Tag, ArrowLeft, RefreshCw, Zap, Shield, Star, Infinity } from "lucide-react";
import { useSubscription, PRODUCT_TIERS } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { storeKitService } from "@/services/storekit";
import { motion } from "framer-motion";

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
  "Jusqu'à 5 annonces/mois",
  "Fonctionnalités de base",
  "Support standard"
];

// Plan display configuration
const PLAN_CONFIG: Record<string, { 
  gradient: string; 
  badgeIcon: string;
  recommended?: boolean;
}> = {
  'Pro Argent': { 
    gradient: 'from-slate-400/10 via-slate-300/5 to-transparent',
    badgeIcon: '🥈',
  },
  'Pro Gold': { 
    gradient: 'from-amber-400/10 via-amber-300/5 to-transparent',
    badgeIcon: '🥇',
    recommended: true,
  },
};

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

  // ID du produit IAP configuré dans App Store Connect (v3 car Apple ne réutilise jamais les Product IDs)
  const IOS_PRODUCT_ID = "com.missdee.carflextest.pro.monthly.v3";
  
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

  // Get Pro plans (Argent and Gold)
  const proPlans = plans.filter(plan => plan.name.startsWith('Pro'));
  const currentPlan = proPlans.find(plan => plan.stripe_product_id === productId);
  const isPro = subscribed && currentPlan !== undefined;
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!plan) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un plan",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlan(plan);
    setSubscribing(true);
    
    try {
      // Sur iOS, utiliser les achats in-app natifs
      if (isIOS) {
        await handleIOSPurchase();
      } else {
        // Sur web/Android, utiliser Stripe
        await handleStripePurchase(plan);
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
      setSelectedPlan(null);
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
      if (error.message?.includes('temporairement indisponible') || error.message?.includes('Product not found')) {
        toast({
          title: "Produit temporairement indisponible",
          description: "Le service est en cours de mise à jour. Veuillez réessayer dans quelques minutes.",
          variant: "destructive"
        });
      } else if (error.message?.includes('identifiant du produit') || error.message?.includes('purchase identifier')) {
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

  const handleStripePurchase = async (plan: SubscriptionPlan) => {
    try {
      console.log('[STRIPE] Création de la session de paiement pour:', plan.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: plan.stripe_price_id,
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
      
      <main className="container mx-auto px-4 pt-20 pb-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        {/* Hero Section avec Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10 text-center py-8 px-4 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden"
        >
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
            >
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Passez au niveau supérieur</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Boostez vos ventes avec <span className="text-primary">CarFlex Pro</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Débloquez toutes les fonctionnalités premium et vendez vos véhicules plus rapidement
            </p>
          </div>
        </motion.div>

        {/* Informations requises par Apple pour les abonnements auto-renouvelables (Guideline 3.1.2) */}
        {isIOS && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50"
          >
            <div className="flex items-start gap-3 mb-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Informations sur l'abonnement</p>
                <p className="text-sm text-muted-foreground">Abonnement CarFlex Pro - Mensuel</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground pl-8">
              <li>• Prix : <span className="font-medium text-foreground">10 000 XOF/mois</span></li>
              <li>• Renouvellement automatique chaque mois</li>
              <li>• Annulable à tout moment (24h avant la fin de période)</li>
              <li>• Gérez vos abonnements dans Réglages &gt; Apple ID</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border/50 flex gap-6 text-xs">
              <Link to="/privacy-policy" className="text-primary hover:underline flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Politique de confidentialité
              </Link>
              <Link to="/terms-of-service" className="text-primary hover:underline">
                Conditions d'utilisation
              </Link>
            </div>
          </motion.div>
        )}

        {/* Plans de tarification - Carousel horizontal sur mobile */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 mb-12 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          {/* Plan Gratuit */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-shrink-0 w-[280px] md:w-auto snap-center"
          >
            <Card className={`relative h-full transition-all duration-300 hover:shadow-lg ${!isPro ? "border-primary/50 shadow-md" : "border-border/50"}`}>
              {!isPro && (
                <div className="absolute -top-3 left-4">
                  <Badge variant="secondary" className="shadow-sm">
                    Plan actuel
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-xl">Gratuit</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">0</span>
                  <span className="text-lg font-medium text-foreground"> XOF</span>
                  <span className="text-muted-foreground">/mois</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Idéal pour débuter et tester la plateforme
                </p>
                <ul className="space-y-3">
                  {FREE_FEATURES.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="rounded-full p-1 bg-muted">
                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plans Pro - Chargés depuis la base de données */}
          {proPlans.map((plan, planIndex) => {
            const config = PLAN_CONFIG[plan.name] || { gradient: 'from-primary/5 to-transparent', badgeIcon: '⭐' };
            const isCurrentPlan = currentPlan?.stripe_product_id === plan.stripe_product_id;
            const isSubscribingToThis = selectedPlan?.id === plan.id && subscribing;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + planIndex * 0.1 }}
                className="flex-shrink-0 w-[280px] md:w-auto snap-center"
              >
                <Card className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                  isCurrentPlan 
                    ? "border-primary shadow-lg shadow-primary/10" 
                    : config.recommended 
                      ? "border-amber-400/50 bg-gradient-to-br " + config.gradient
                      : "border-primary/30 bg-gradient-to-br " + config.gradient
                }`}>
                  {/* Badge recommandé ou plan actuel */}
                  <div className="absolute -top-3 left-4 flex gap-2">
                    {isCurrentPlan ? (
                      <Badge className="bg-primary shadow-sm">
                        <Crown className="h-3 w-3 mr-1" />
                        Plan actuel
                      </Badge>
                    ) : config.recommended ? (
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-sm">
                        <Star className="h-3 w-3 mr-1" />
                        Recommandé
                      </Badge>
                    ) : null}
                  </div>
                  
                  <CardHeader className="pt-8">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{config.badgeIcon}</span>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>
                      <span className="text-4xl font-bold text-foreground">{formatPrice(plan.price).replace(' XOF', '')}</span>
                      <span className="text-lg font-medium text-foreground"> XOF</span>
                      <span className="text-muted-foreground">/mois</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {plan.description || "Maximisez votre visibilité et vos ventes"}
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`rounded-full p-1 ${config.recommended ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                            <Check className={`h-3.5 w-3.5 ${config.recommended ? 'text-amber-600' : 'text-primary'}`} />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4">
                    {!isCurrentPlan ? (
                      <div className="w-full space-y-3">
                        {/* Codes promo uniquement pour Web/Android (Stripe) */}
                        {!isIOS && !isPro && (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowPromoInput(!showPromoInput)}
                              className="w-full border-dashed"
                              size="sm"
                            >
                              <Tag className="mr-2 h-4 w-4" />
                              {showPromoInput ? "Masquer" : "J'ai un"} code promo
                            </Button>
                            
                            {showPromoInput && (
                              <Input
                                placeholder="Entrez votre code promo"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="text-center uppercase"
                              />
                            )}
                          </div>
                        )}

                        <Button
                          onClick={() => handleSubscribe(plan)} 
                          disabled={subscribing || restoring}
                          className={`w-full shadow-lg ${
                            config.recommended 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 shadow-amber-500/20' 
                              : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-primary/20'
                          }`}
                          size="lg"
                        >
                          {isSubscribingToThis ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isIOS ? "Ouverture App Store..." : "Redirection..."}
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              {isPro ? "Changer de plan" : `Passer à ${plan.name}`}
                            </>
                          )}
                        </Button>
                        
                        {isIOS && !isPro && (
                          <Button
                            onClick={handleRestorePurchases}
                            disabled={subscribing || restoring}
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            size="sm"
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
                      <div className="w-full space-y-3">
                        {subscriptionEnd && (
                          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground">Prochain renouvellement</p>
                            <p className="font-medium text-primary">
                              {new Date(subscriptionEnd).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
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
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            size="sm"
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
              </motion.div>
            );
          })}
        </div>

        {/* Section des avantages Pro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-center mb-6">
            Pourquoi passer à <span className="text-primary">Pro</span> ?
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: TrendingUp,
                title: "Visibilité maximale",
                description: "Vos annonces apparaissent en premier",
                color: "from-blue-500/10 to-blue-500/5"
              },
              {
                icon: Crown,
                title: "Badge Pro",
                description: "Gagnez en crédibilité et confiance",
                color: "from-amber-500/10 to-amber-500/5"
              },
              {
                icon: Infinity,
                title: "Annonces illimitées",
                description: "Publiez sans aucune limite",
                color: "from-green-500/10 to-green-500/5"
              },
              {
                icon: BarChart3,
                title: "Statistiques avancées",
                description: "Analysez vos performances",
                color: "from-purple-500/10 to-purple-500/5"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className={`h-full border-0 bg-gradient-to-br ${feature.color} hover:shadow-md transition-all duration-300`}>
                  <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-background shadow-sm mb-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section garantie */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50"
        >
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Satisfaction garantie</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Annulez à tout moment. Pas d'engagement, pas de surprise. 
            Votre abonnement reste actif jusqu'à la fin de la période payée.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Subscription;
