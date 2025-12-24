import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useCountry } from "@/contexts/CountryContext";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { Capacitor } from "@capacitor/core";
import { storeKitService } from "@/services/storekit";

// Mapping des packages vers les Product IDs iOS (nouveaux IDs car les anciens ont été supprimés)
const IOS_PRODUCT_IDS: { [key: number]: string } = {
  3: "com.missdee.carflextest.boost.3days",
  7: "com.missdee.carflextest.boost.7days",
  15: "com.missdee.carflextest.boost.15days",
};

interface PremiumPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

interface UserListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: 'sale' | 'rental';
}

const PromoteListing = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState(""); // Web/Android uniquement
  const [showPromoInput, setShowPromoInput] = useState(false); // Web/Android uniquement
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<PremiumPackage | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsIOS(platform === 'ios');
    checkUser();
    initializeStoreKit();
  }, []);

  const initializeStoreKit = async () => {
    if (Capacitor.getPlatform() === 'ios') {
      try {
        await storeKitService.initialize();
        console.log('[PromoteListing] StoreKit initialized');
      } catch (error) {
        console.error('[PromoteListing] StoreKit init error:', error);
      }
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUser(user);
    await Promise.all([fetchPackages(), fetchUserListings(user.id)]);
    setLoading(false);
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("premium_packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching packages:", error);
      return;
    }

    setPackages(data as PremiumPackage[] || []);
  };

  const fetchUserListings = async (userId: string) => {
    // Fetch sale listings
    const { data: saleData } = await supabase
      .from("sale_listings")
      .select("id, brand, model, year")
      .eq("seller_id", userId);

    // Fetch rental listings
    const { data: rentalData } = await supabase
      .from("rental_listings")
      .select("id, brand, model, year")
      .eq("owner_id", userId);

    const sales = (saleData || []).map(item => ({ ...item, type: 'sale' as const }));
    const rentals = (rentalData || []).map(item => ({ ...item, type: 'rental' as const }));

    setUserListings([...sales, ...rentals]);
  };

  const handlePromote = async () => {
    if (!selectedListing || !selectedPackage) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une annonce et un pack",
        variant: "destructive",
      });
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setSelectedPackageData(pkg);
    
    // Sur iOS, appeler directement l'achat natif (règles App Store)
    if (isIOS) {
      await handleIOSPremiumPurchase();
    } else {
      // Sur web/Android, afficher le sélecteur de paiement
      setShowPaymentSelector(true);
    }
  };

  const handleIOSPremiumPurchase = async () => {
    const listing = userListings.find(l => l.id === selectedListing);
    const pkg = packages.find(p => p.id === selectedPackage);
    if (!listing || !pkg) return;

    const productId = IOS_PRODUCT_IDS[pkg.duration_days];
    if (!productId) {
      toast({
        title: "Erreur",
        description: "Pack non disponible sur iOS",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (!storeKitService.isAvailable()) {
        toast({
          title: "Service indisponible",
          description: "StoreKit n'est pas disponible. Veuillez tester sur un appareil iOS réel.",
          variant: "destructive"
        });
        throw new Error("StoreKit non disponible");
      }
      
      toast({
        title: "Traitement en cours...",
        description: "Ouverture du système de paiement Apple",
      });

      // Acheter le produit via StoreKit natif
      const purchaseResult = await storeKitService.purchase(productId);
      
      console.log('[StoreKit Purchase] Success:', purchaseResult);

      toast({
        title: "Validation en cours...",
        description: "Vérification de votre achat avec le serveur",
      });

      // Vérifier et activer le premium via notre backend
      const { data: sessionData } = await supabase.auth.getSession();
      const verifyResponse = await supabase.functions.invoke('verify-ios-purchase', {
        body: {
          purchase_type: 'premium_listing',
          package_id: selectedPackage,
          listing_id: selectedListing,
          listing_type: listing.type,
          product_id: productId,
          transaction_id: purchaseResult.transactionId,
          purchase_date: purchaseResult.purchaseDate.toISOString(),
          original_transaction_id: purchaseResult.originalTransactionId
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

       if (verifyResponse.error) {
         throw verifyResponse.error;
       }
       if (verifyResponse.data?.error) {
         throw new Error(verifyResponse.data.user_message || verifyResponse.data.error);
       }

      toast({
        title: "✅ Pack Premium activé !",
        description: `Votre annonce est maintenant promue pour ${pkg.duration_days} jours.`,
      });

      // Rediriger vers les annonces
      setTimeout(() => navigate('/listings'), 2000);

    } catch (error: any) {
      console.error('[StoreKit Purchase] Error:', error);
      
      // Ne pas afficher de toast si c'est une annulation
      if (error.message === 'CANCELLED') {
        toast({
          title: "Achat annulé",
          description: "Vous pouvez réessayer quand vous voulez",
        });
      } else if (error.message?.includes('Méthode de paiement invalide')) {
        toast({
          title: "Paiement invalide",
          description: "Veuillez vérifier votre méthode de paiement dans les réglages iOS",
          variant: "destructive"
        });
      } else if (error.message?.includes('Erreur réseau')) {
        toast({
          title: "Problème de connexion",
          description: "Vérifiez votre connexion internet et réessayez",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur d'achat",
          description: error.message || "Impossible de finaliser l'achat",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
      setShowPaymentSelector(false);
    }
  };

  const handlePaymentMethod = async (method: 'stripe' | 'apple-pay' | 'wave' | 'paypal') => {
    const listing = userListings.find(l => l.id === selectedListing);
    if (!listing) return;

    // Sur iOS, utiliser IAP natif au lieu de Stripe
    if (Capacitor.getPlatform() === 'ios') {
      await handleIOSPremiumPurchase();
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (method === 'stripe' || method === 'apple-pay') {
        toast({
          title: "Préparation du paiement",
          description: "Redirection vers la page de paiement...",
        });

        const response = await supabase.functions.invoke('create-premium-payment', {
          body: {
            package_id: selectedPackage,
            listing_id: selectedListing,
            listing_type: listing.type
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`
          }
        });

        console.log('Response complète:', response);

        if (response.error) {
          console.error('Erreur:', response.error);
          throw response.error;
        }

        if (response.data?.url) {
          console.log('Redirection vers:', response.data.url);
          
          toast({
            title: method === 'apple-pay' ? "Redirection vers Apple Pay" : "Redirection vers Stripe",
            description: "Si la page ne s'ouvre pas, cliquez sur le lien ci-dessous",
            duration: 10000,
          });
          
          // Ouvrir dans un nouvel onglet (mieux pour mobile)
          const newWindow = window.open(response.data.url, '_blank');
          
          // Fallback si le popup est bloqué
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Créer un lien de secours
            const link = document.createElement('a');
            link.href = response.data.url;
            link.target = '_blank';
            link.textContent = 'Cliquez ici pour continuer vers le paiement';
            link.style.cssText = 'display: block; margin: 20px auto; padding: 15px; background: hsl(var(--primary)); color: white; text-align: center; border-radius: 8px; max-width: 400px; text-decoration: none; font-weight: 500;';
            document.body.appendChild(link);
            
            toast({
              title: "Action requise",
              description: "Veuillez cliquer sur le lien qui vient d'apparaître pour continuer",
              variant: "default",
            });
          }
        } else {
          console.error('Pas d\'URL dans la réponse:', response.data);
          throw new Error("URL de paiement non reçue");
        }
      } else if (method === 'wave') {
        toast({
          title: "Bientôt disponible",
          description: "Le paiement Wave sera disponible prochainement",
        });
      } else if (method === 'paypal') {
        toast({
          title: "Préparation du paiement PayPal",
          description: "Redirection vers PayPal...",
        });

        const response = await supabase.functions.invoke('create-paypal-payment', {
          body: {
            package_id: selectedPackage,
            listing_id: selectedListing,
            listing_type: listing.type
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`
          }
        });

        if (response.error) {
          console.error('Erreur PayPal:', response.error);
          throw response.error;
        }

        if (response.data?.url) {
          console.log('Redirection vers PayPal:', response.data.url);
          
          toast({
            title: "Redirection vers PayPal",
            description: "Si la page ne s'ouvre pas, cliquez sur le lien ci-dessous",
            duration: 10000,
          });
          
          // Ouvrir dans un nouvel onglet
          const newWindow = window.open(response.data.url, '_blank');
          
          // Fallback si le popup est bloqué
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            const link = document.createElement('a');
            link.href = response.data.url;
            link.target = '_blank';
            link.textContent = 'Cliquez ici pour continuer vers PayPal';
            link.style.cssText = 'display: block; margin: 20px auto; padding: 15px; background: hsl(var(--primary)); color: white; text-align: center; border-radius: 8px; max-width: 400px; text-decoration: none; font-weight: 500;';
            document.body.appendChild(link);
            
            toast({
              title: "Action requise",
              description: "Veuillez cliquer sur le lien qui vient d'apparaître pour continuer",
              variant: "default",
            });
          }
        } else {
          console.error('Pas d\'URL PayPal dans la réponse:', response.data);
          throw new Error("URL de paiement PayPal non reçue");
        }
      }

    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initier le paiement",
        variant: "destructive",
      });
    }
  };

  const handleRestorePurchases = async () => {
    if (!isIOS) return;
    
    setRestoring(true);
    
    try {
      console.log('[StoreKit] Démarrage de la restauration (PromoteListing)...');
      
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
          description: "Aucun package premium n'a été trouvé pour ce compte Apple",
        });
        return;
      }
      
      // Vérifier chaque achat restauré avec le backend
      toast({
        title: "Validation en cours...",
        description: `Vérification de ${restoredPurchases.length} achat(s)`,
      });
      
      let successCount = 0;
      for (const purchase of restoredPurchases) {
        try {
          // Synchroniser avec le backend
           const { data, error } = await supabase.functions.invoke('verify-ios-purchase', {
             body: {
               transaction_id: purchase.transactionId,
               product_id: purchase.productId,
               purchase_type: 'premium_listing',
               // Note: listing_id et package_id seront déduits du product_id
             }
           });

           if (!error && !data?.error) {
             successCount++;
           }
        } catch (error) {
          console.error('[StoreKit] Erreur sync achat restauré:', error);
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "✅ Achats restaurés avec succès !",
          description: `${successCount} package(s) premium restauré(s).`,
        });
        
        // Rafraîchir la page après 2 secondes pour afficher les mises à jour
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Erreur de restauration",
          description: "Impossible de vérifier les achats restaurés. Contactez le support.",
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      console.error('[StoreKit] Erreur restauration:', error);
      
      if (error.message?.includes('CANCELLED') || error.message?.includes('cancelled')) {
        toast({
          title: "Restauration annulée",
          description: "Vous pouvez réessayer quand vous voulez",
        });
      } else {
        toast({
          title: "Erreur de restauration",
          description: error.message || "Impossible de restaurer les achats. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } finally {
      setRestoring(false);
    }
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Promouvoir une annonce</h1>
          <p className="text-muted-foreground">
            Donnez plus de visibilité à vos annonces avec nos packs premium
          </p>
        </div>

        {/* Package Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{pkg.name}</CardTitle>
                  {selectedPackage === pkg.id && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">{formatPrice(pkg.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      pour {pkg.duration_days} jours
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Avantages inclus :</p>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Aucun pack premium disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Listing Selection */}
        {selectedPackage && (
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner une annonce</CardTitle>
              <CardDescription>
                Choisissez l'annonce que vous souhaitez promouvoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userListings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Vous n'avez pas encore d'annonces.{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => navigate("/sell")}
                  >
                    Créer une annonce
                  </Button>
                </p>
              ) : (
                  <>
                    <Select value={selectedListing} onValueChange={setSelectedListing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une annonce" />
                      </SelectTrigger>
                      <SelectContent>
                        {userListings.map((listing) => (
                          <SelectItem key={listing.id} value={listing.id}>
                            {listing.brand} {listing.model} ({listing.year}) -{" "}
                            <Badge variant="outline" className="ml-2">
                              {listing.type === 'sale' ? 'Vente' : 'Location'}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Codes promo uniquement pour Web/Android (Stripe) */}
                    {!isIOS && (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPromoInput(!showPromoInput)}
                          className="w-full"
                        >
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
                      onClick={handlePromote}
                      disabled={!selectedListing || submitting || restoring}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : isIOS ? (
                        "Acheter via l'App Store"
                      ) : (
                        "Continuer vers le paiement"
                      )}
                    </Button>
                    
                    {isIOS && (
                      <Button
                        onClick={handleRestorePurchases}
                        disabled={submitting || restoring}
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
                            Restaurer mes achats premium
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* PaymentMethodSelector uniquement sur Web/Android (règles App Store) */}
      {!isIOS && (
        <PaymentMethodSelector
          open={showPaymentSelector}
          onOpenChange={setShowPaymentSelector}
          onSelectMethod={handlePaymentMethod}
          amount={selectedPackageData?.price || 0}
          formatPrice={formatPrice}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default PromoteListing;
