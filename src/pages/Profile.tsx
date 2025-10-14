import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Crown, ShoppingCart, Store, UserCheck, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCountry } from "@/contexts/CountryContext";

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
  price?: number;
  price_per_day?: number;
  images?: any;
  profiles?: {
    first_name: string;
    last_name: string;
    user_type: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (roles && roles.length > 0) {
        setIsAdmin(true);
      }

      await fetchUserListings(user.id);
      await fetchPackages();
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchUserListings = async (userId: string) => {
    const { data: saleData } = await supabase
      .from("sale_listings")
      .select(`
        id, 
        brand, 
        model, 
        year, 
        price, 
        images,
        seller_id,
        profiles!sale_listings_seller_id_fkey (
          first_name,
          last_name,
          user_type
        )
      `)
      .eq("seller_id", userId);

    const { data: rentalData } = await supabase
      .from("rental_listings")
      .select(`
        id, 
        brand, 
        model, 
        year, 
        price_per_day, 
        images,
        owner_id,
        profiles!rental_listings_owner_id_fkey (
          first_name,
          last_name,
          user_type
        )
      `)
      .eq("owner_id", userId);

    const sales = (saleData || []).map(item => ({ ...item, type: 'sale' as const }));
    const rentals = (rentalData || []).map(item => ({ ...item, type: 'rental' as const }));

    setUserListings([...sales, ...rentals]);
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("premium_packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (!error) {
      setPackages(data as PremiumPackage[] || []);
    }
  };

  const handlePromote = async (listingId: string, listingType: 'sale' | 'rental') => {
    setSelectedListing(listingId);
    setDialogOpen(true);
  };

  const confirmPromote = async () => {
    if (!selectedListing || !selectedPackage) {
      toast.error("Veuillez sélectionner un pack");
      return;
    }

    setSubmitting(true);

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    const listing = userListings.find(l => l.id === selectedListing);
    if (!listing) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.duration_days);

    const { error } = await supabase
      .from("premium_listings")
      .insert([{
        listing_id: selectedListing,
        listing_type: listing.type,
        package_id: selectedPackage,
        user_id: user.id,
        end_date: endDate.toISOString(),
      }]);

    setSubmitting(false);

    if (error) {
      toast.error("Impossible de promouvoir l'annonce");
      console.error(error);
      return;
    }

    toast.success("Annonce promue avec succès !");
    setDialogOpen(false);
    setSelectedListing("");
    setSelectedPackage("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Mon Profil</TabsTrigger>
              <TabsTrigger value="listings">Mes Annonces</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        <UserIcon className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">
                          {profile?.first_name} {profile?.last_name}
                        </h2>
                        {profile?.user_type === "buyer" && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            Acheteur
                          </Badge>
                        )}
                        {profile?.user_type === "seller" && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                            <Store className="h-3 w-3" />
                            Vendeur
                          </Badge>
                        )}
                        {profile?.user_type === "agent" && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <UserCheck className="h-3 w-3" />
                            Agent
                          </Badge>
                        )}
                        {profile?.user_type === "dealer" && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200">
                            <Building2 className="h-3 w-3" />
                            Concessionnaire
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{profile?.user_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone:</span>
                        <p className="font-medium">{profile?.phone || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ville:</span>
                        <p className="font-medium">{profile?.city || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pays:</span>
                        <p className="font-medium">{profile?.country || "Non renseigné"}</p>
                      </div>
                    </div>

                    {profile?.company_name && (
                      <div>
                        <span className="text-muted-foreground">Entreprise:</span>
                        <p className="font-medium">{profile.company_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => navigate("/profile/edit")}>
                      Modifier le profil
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" className="w-full bg-amber-50 hover:bg-amber-100 border-amber-200" onClick={() => navigate("/admin")}>
                        <Crown className="mr-2 h-4 w-4 text-amber-500" />
                        Panneau Admin
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => navigate("/favorites")}>
                      Mes favoris
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Mes Annonces</CardTitle>
                </CardHeader>
                <CardContent>
                  {userListings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore d'annonces
                      </p>
                      <Button onClick={() => navigate("/sell")}>
                        Créer une annonce
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userListings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden">
                          <div className="flex gap-4 p-4">
                            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {listing.images?.[0] && (
                                <img 
                                  src={listing.images[0]} 
                                  alt={`${listing.brand} ${listing.model}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-base">
                                    {listing.brand} {listing.model}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {listing.year} • {listing.type === 'sale' ? 'Vente' : 'Location'}
                                  </p>
                                  {listing.profiles && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {listing.profiles.user_type === 'buyer' && 'Acheteur'}
                                        {listing.profiles.user_type === 'seller' && 'Vendeur'}
                                        {listing.profiles.user_type === 'agent' && 'Agent'}
                                        {listing.profiles.user_type === 'dealer' && 'Concessionnaire'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {listing.profiles.first_name} {listing.profiles.last_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-sm">
                                  {listing.type === 'sale' 
                                    ? formatPrice(listing.price || 0)
                                    : `${formatPrice(listing.price_per_day || 0)}/jour`}
                                </Badge>
                              </div>
                              <Button 
                                onClick={() => handlePromote(listing.id, listing.type)}
                                size="sm"
                                className="bg-gradient-to-r from-primary to-primary/80"
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Promouvoir
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choisir un pack premium</DialogTitle>
            <DialogDescription>
              Sélectionnez le pack qui correspond à vos besoins
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {selectedPackage === pkg.id && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">{pkg.price} DH</p>
                      <p className="text-sm text-muted-foreground">
                        pour {pkg.duration_days} jours
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Avantages :</p>
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

            {packages.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Aucun pack disponible pour le moment
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={confirmPromote}
              disabled={!selectedPackage || submitting}
            >
              {submitting ? "Traitement..." : "Confirmer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Profile;
