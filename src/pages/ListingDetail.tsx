import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import ImageCarousel from "@/components/ImageCarousel";
import ChatBox from "@/components/ChatBox";
import ReviewsList from "@/components/ReviewsList";
import AddReview from "@/components/AddReview";
import DealRatingBadge from "@/components/DealRatingBadge";
import ReviewsSection from "@/components/ReviewsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Gauge, 
  MapPin, 
  Fuel, 
  Settings, 
  Heart,
  Share2,
  ArrowLeft,
  MessageCircle,
  Palette,
  Car,
  Users,
  Wrench,
  Shield,
  AlertCircle,
  User as UserIcon
} from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { useConversation } from "@/hooks/useConversation";
import { useCountry } from "@/contexts/CountryContext";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites(id);
  const { conversationId, loading: convLoading } = useConversation(
    id || "", 
    listing?.seller_id || ""
  );
  const { formatPrice } = useCountry();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("sale_listings")
      .select(`
        *,
        profiles!sale_listings_seller_id_fkey (
          first_name,
          last_name,
          user_type,
          avatar_url,
          phone,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching listing:", error);
      toast.error("Erreur lors du chargement de l'annonce");
    } else {
      setListing(data);
    }

    setLoading(false);
  };

  const handleFavorite = () => {
    toggleFavorite();
  };

  const handleContactSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    if (listing?.seller_id === user.id) {
      toast.error("Vous ne pouvez pas vous contacter vous-même");
      return;
    }

    // Redirect to Messages page
    navigate("/messages");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Annonce non trouvée</p>
          <Button onClick={() => navigate("/listings")} className="mt-4 mx-auto block">
            Retour aux annonces
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const features = Array.isArray(listing.features) ? listing.features : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Image Gallery */}
        <div className="mb-6">
          <ImageCarousel 
            images={images} 
            alt={`${listing.brand} ${listing.model}`}
          />
        </div>

        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">
                {listing.brand} {listing.model}
              </h1>
              <DealRatingBadge listingId={id!} listingType="sale" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{listing.city}, {listing.country}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Price */}
        <div className="bg-gradient-card rounded-lg p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Prix</p>
          <p className="text-2xl font-bold text-accent">
            {formatPrice(listing.price)}
          </p>
        </div>

        {/* Seller Info - Enhanced */}
        {listing.profiles && (
          <Card className="mb-6 shadow-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">À propos du vendeur</h2>
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16 cursor-pointer" onClick={() => navigate(`/profile/${listing.seller_id}`)}>
                  <AvatarImage src={listing.profiles.avatar_url} />
                  <AvatarFallback>
                    <UserIcon className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/profile/${listing.seller_id}`)}
                  >
                    {listing.profiles.first_name} {listing.profiles.last_name}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {listing.profiles.user_type === 'buyer' && 'Acheteur'}
                    {listing.profiles.user_type === 'seller' && 'Vendeur'}
                    {listing.profiles.user_type === 'agent' && 'Agent'}
                    {listing.profiles.user_type === 'dealer' && 'Concessionnaire'}
                  </Badge>
                  {listing.profiles.phone && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {listing.profiles.phone}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/profile/${listing.seller_id}`)}
              >
                Voir toutes les annonces de ce vendeur
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Specifications */}
        <div className="bg-card rounded-lg p-6 mb-6 shadow-card">
          <h2 className="text-xl font-bold mb-4">Caractéristiques principales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Année</p>
                <p className="font-semibold">{listing.year}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Kilométrage</p>
                <p className="font-semibold">{listing.mileage.toLocaleString()} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Transmission</p>
                <p className="font-semibold">{listing.transmission === "automatic" ? "Automatique" : "Manuelle"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Fuel className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Carburant</p>
                <p className="font-semibold capitalize">{listing.fuel_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="bg-card rounded-lg p-6 mb-6 shadow-card">
          <h2 className="text-xl font-bold mb-4">Détails complets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exterior & Interior */}
            {(listing.exterior_color || listing.interior_color) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Couleurs</h3>
                </div>
                {listing.exterior_color && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Extérieur</span>
                    <span className="font-medium">{listing.exterior_color}</span>
                  </div>
                )}
                {listing.interior_color && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Intérieur</span>
                    <span className="font-medium">{listing.interior_color}</span>
                  </div>
                )}
              </div>
            )}

            {/* Body & Capacity */}
            {(listing.body_type || listing.doors || listing.seats) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Carrosserie</h3>
                </div>
                {listing.body_type && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-medium">{listing.body_type}</span>
                  </div>
                )}
                {listing.doors && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Portes</span>
                    <span className="font-medium">{listing.doors}</span>
                  </div>
                )}
                {listing.seats && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sièges</span>
                    <span className="font-medium">{listing.seats}</span>
                  </div>
                )}
              </div>
            )}

            {/* Engine */}
            {(listing.engine || listing.horsepower || listing.cylinders) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Moteur</h3>
                </div>
                {listing.engine && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-medium">{listing.engine}</span>
                  </div>
                )}
                {listing.horsepower && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Puissance</span>
                    <span className="font-medium">{listing.horsepower} ch</span>
                  </div>
                )}
                {listing.cylinders && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cylindres</span>
                    <span className="font-medium">{listing.cylinders}</span>
                  </div>
                )}
              </div>
            )}

            {/* History */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Historique</h3>
              </div>
              {listing.condition && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">État</span>
                  <Badge variant={listing.condition === 'new' ? 'default' : 'secondary'}>
                    {listing.condition === 'new' ? 'Neuf' : 'Occasion'}
                  </Badge>
                </div>
              )}
              {listing.previous_owners !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Propriétaires</span>
                  <span className="font-medium">{listing.previous_owners}</span>
                </div>
              )}
              {listing.accidents !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accidents</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{listing.accidents}</span>
                    {listing.accidents > 0 && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
              )}
              {listing.clean_title !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Titre propre</span>
                  <Badge variant={listing.clean_title ? 'default' : 'destructive'}>
                    {listing.clean_title ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              )}
              {listing.last_service && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dernier service</span>
                  <span className="font-medium">{new Date(listing.last_service).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="bg-card rounded-lg p-6 mb-6 shadow-card">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {listing.description}
            </p>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="bg-card rounded-lg p-6 mb-6 shadow-card">
            <h2 className="text-xl font-bold mb-4">Équipements</h2>
            <div className="flex flex-wrap gap-2">
              {features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Reviews Section */}
        <ReviewsSection listingId={id!} sellerId={listing.seller_id} />

        <Separator className="my-6" />

        {/* Add Review */}
        <AddReview 
          listingId={id!} 
          onReviewAdded={() => setReviewsKey(prev => prev + 1)}
        />

        <Separator className="my-6" />

        {/* Tabs for Contact */}
        <Tabs defaultValue="contact" className="mb-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleContactSeller}
                disabled={convLoading}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contacter le vendeur
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                Demander un essai
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
      
      {/* Chat Box */}
      {chatOpen && conversationId && (
        <ChatBox 
          conversationId={conversationId} 
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
};

export default ListingDetail;
