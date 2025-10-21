import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useCountry } from "@/contexts/CountryContext";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";

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
  const [promoCode, setPromoCode] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<PremiumPackage | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

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
    setShowPaymentSelector(true);
  };

  const handlePaymentMethod = async (method: 'stripe' | 'wave' | 'paypal') => {
    const listing = userListings.find(l => l.id === selectedListing);
    if (!listing) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (method === 'stripe') {
        toast({
          title: "Préparation du paiement",
          description: "Redirection vers la page de paiement...",
        });

        const { data, error } = await supabase.functions.invoke('create-premium-payment', {
          body: {
            package_id: selectedPackage,
            listing_id: selectedListing,
            listing_type: listing.type
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Redirection directe vers Stripe avec un petit délai
          setTimeout(() => {
            window.location.href = data.url;
          }, 100);
        } else {
          throw new Error("URL de paiement non reçue");
        }
      } else if (method === 'wave') {
        toast({
          title: "Bientôt disponible",
          description: "Le paiement Wave sera disponible prochainement",
        });
      } else if (method === 'paypal') {
        toast({
          title: "Bientôt disponible",
          description: "Le paiement PayPal sera disponible prochainement",
        });
      }

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initier le paiement",
        variant: "destructive",
      });
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

                    <Button
                      onClick={handlePromote}
                      disabled={!selectedListing || submitting}
                      className="w-full"
                      size="lg"
                    >
                      Continuer vers le paiement
                    </Button>
                  </>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      <PaymentMethodSelector
        open={showPaymentSelector}
        onOpenChange={setShowPaymentSelector}
        onSelectMethod={handlePaymentMethod}
        amount={selectedPackageData?.price || 0}
        formatPrice={formatPrice}
      />

      <BottomNav />
    </div>
  );
};

export default PromoteListing;
