import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Gauge, 
  MapPin, 
  Fuel, 
  Settings, 
  Heart,
  Share2,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("sale_listings")
      .select("*")
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
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
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
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={`${listing.brand} ${listing.model}`}
              className="w-full h-[400px] object-cover rounded-lg shadow-card"
            />
          ) : (
            <div className="w-full h-[400px] bg-gradient-card rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Image non disponible</span>
            </div>
          )}
        </div>

        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {listing.brand} {listing.model}
            </h1>
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
          <p className="text-4xl font-bold text-accent">
            {listing.price.toLocaleString()} €
          </p>
        </div>

        {/* Specifications */}
        <div className="bg-card rounded-lg p-6 mb-6 shadow-card">
          <h2 className="text-xl font-bold mb-4">Caractéristiques</h2>
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

        {/* Contact Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" className="w-full">
            <MessageCircle className="h-5 w-5 mr-2" />
            Contacter le vendeur
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            Demander un essai
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ListingDetail;
