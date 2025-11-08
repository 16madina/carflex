import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import ReportContentDialog from "@/components/ReportContentDialog";
import BlockUserButton from "@/components/BlockUserButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User as UserIcon, 
  MapPin, 
  ShoppingCart, 
  Store, 
  UserCheck, 
  Building2,
  Star,
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import ReviewsList from "@/components/ReviewsList";
import CarCard from "@/components/CarCard";
import { useCountry } from "@/contexts/CountryContext";

interface UserListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: 'sale' | 'rental';
  price?: number;
  price_per_day?: number;
  mileage?: number;
  images?: any;
  city?: string;
  country?: string;
}

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchListings();
      fetchReviewStats();
    }
  }, [userId]);

  const fetchProfile = async () => {
    // Sélectionner uniquement les colonnes publiques (sans email et phone)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_type, first_name, last_name, country, city, company_name, avatar_url, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erreur lors du chargement du profil");
    } else {
      setProfile(data);
    }
  };

  const fetchListings = async () => {
    const { data: saleData } = await supabase
      .from("sale_listings")
      .select("id, brand, model, year, price, mileage, images, city, country")
      .eq("seller_id", userId);

    const { data: rentalData } = await supabase
      .from("rental_listings")
      .select("id, brand, model, year, price_per_day, mileage, images, city, country")
      .eq("owner_id", userId);

    const sales = (saleData || []).map(item => ({ ...item, type: 'sale' as const }));
    const rentals = (rentalData || []).map(item => ({ ...item, type: 'rental' as const }));

    setListings([...sales, ...rentals]);
  };

  const fetchReviewStats = async () => {
    // Récupérer toutes les annonces du vendeur
    const { data: saleListings } = await supabase
      .from("sale_listings")
      .select("id")
      .eq("seller_id", userId);

    const { data: rentalListings } = await supabase
      .from("rental_listings")
      .select("id")
      .eq("owner_id", userId);

    const allListingIds = [
      ...(saleListings || []).map(l => l.id),
      ...(rentalListings || []).map(l => l.id)
    ];

    if (allListingIds.length === 0) {
      setReviewStats({ count: 0, average: 0 });
      setLoading(false);
      return;
    }

    // Récupérer tous les avis
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .in("listing_id", allListingIds);

    if (reviews && reviews.length > 0) {
      const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      setReviewStats({
        count: reviews.length,
        average: Math.round(average * 10) / 10
      });
    } else {
      setReviewStats({ count: 0, average: 0 });
    }

    setLoading(false);
  };

  const handleContactSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    if (userId === user.id) {
      toast.error("Vous ne pouvez pas vous contacter vous-même");
      return;
    }

    navigate("/messages");
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Profil non trouvé</p>
          <Button onClick={() => navigate("/")} className="mt-4 mx-auto block">
            Retour à l'accueil
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "buyer":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            Acheteur
          </Badge>
        );
      case "seller":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
            <Store className="h-3 w-3" />
            Vendeur
          </Badge>
        );
      case "agent":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
            <UserCheck className="h-3 w-3" />
            Agent
          </Badge>
        );
      case "dealer":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800">
            <Building2 className="h-3 w-3" />
            Concessionnaire
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Header Card */}
        <Card className="mb-6 shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">
                        {profile.first_name} {profile.last_name}
                      </h1>
                      {getUserTypeBadge(profile.user_type)}
                    </div>

                    {profile.company_name && (
                      <p className="text-lg text-muted-foreground mb-2">
                        {profile.company_name}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {(profile.city || profile.country) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.city}{profile.city && profile.country && ", "}{profile.country}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2">
                    <Button onClick={handleContactSeller} size="lg" className="flex-1">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contacter
                    </Button>
                    <ReportContentDialog 
                      contentType="user" 
                      contentId={userId!}
                      triggerText="Signaler"
                      triggerVariant="outline"
                    />
                    <BlockUserButton 
                      userId={userId!} 
                      userName={`${profile.first_name} ${profile.last_name}`}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{listings.length}</p>
                    <p className="text-sm text-muted-foreground">Annonces</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <p className="text-2xl font-bold text-primary">
                        {reviewStats?.average || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{reviewStats?.count || 0}</p>
                    <p className="text-sm text-muted-foreground">Avis</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="listings">Annonces ({listings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({reviewStats?.count || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucune annonce pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <CarCard
                    key={listing.id}
                    id={listing.id}
                    brand={listing.brand}
                    model={listing.model}
                    year={listing.year}
                    price={listing.type === 'sale' ? (listing.price || 0) : (listing.price_per_day || 0)}
                    mileage={listing.mileage || 0}
                    city={listing.city || ''}
                    image={listing.images?.[0]}
                    transmission="Automatique"
                    isRental={listing.type === 'rental'}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="pt-6">
                <ReviewsList sellerId={userId!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default PublicProfile;
