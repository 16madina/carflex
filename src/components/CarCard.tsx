import { useState } from "react";
import { Heart, MapPin, Calendar, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/contexts/CountryContext";
import { useFavorites } from "@/hooks/useFavorites";
import DealRatingBadge from "./DealRatingBadge";
import ImageCarousel from "./ImageCarousel";

interface CarCardProps {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  image?: string;
  images?: string[];
  transmission: string;
  onFavoriteToggle?: () => void;
  isRental?: boolean;
  sellerName?: string;
  sellerType?: string;
}

const CarCard = ({
  id,
  brand,
  model,
  year,
  price,
  mileage,
  city,
  image,
  images,
  transmission,
  onFavoriteToggle,
  isRental = false,
  sellerName,
  sellerType,
}: CarCardProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [rating, setRating] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites(id, isRental ? "rental" : "sale");

  const handleCardClick = () => {
    navigate(isRental ? `/rental/${id}` : `/listing/${id}`);
  };

  const handleFavoriteClick = () => {
    toggleFavorite();
    onFavoriteToggle?.();
  };

  const displayImages = images && images.length > 0 ? images : (image ? [image] : []);

  const getPriceColorClass = (dealRating: string | null) => {
    switch(dealRating) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-amber-600';
      case 'poor':
        return 'text-orange-500';
      default:
        return 'text-accent';
    }
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        {displayImages.length > 0 ? (
          <div onClick={(e) => e.stopPropagation()}>
            <ImageCarousel 
              images={displayImages} 
              alt={`${brand} ${model}`}
              showNavigation={false}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-card flex items-center justify-center">
            <span className="text-muted-foreground">Image non disponible</span>
          </div>
        )}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 rounded-full shadow-lg z-10 h-11 w-11 md:h-10 md:w-10"
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteClick();
          }}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-5 w-5 md:h-4 md:w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
        </Button>
        <div className="absolute bottom-3 left-3 z-10">
          <DealRatingBadge 
            listingId={id} 
            listingType={isRental ? "rental" : "sale"}
            onRatingCalculated={setRating}
          />
        </div>
      </div>

      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1">
            {brand} {model}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{transmission}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            <span>{mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{city}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`text-xl font-bold ${getPriceColorClass(rating)}`}>
              {formatPrice(price)}
              {isRental && (
                <span className="text-sm text-muted-foreground ml-1">/jour</span>
              )}
            </div>
            {sellerName && sellerType && (
              <div className="text-xs text-muted-foreground mt-1">
                {sellerName} • {
                  sellerType === 'dealer' ? 'Concessionnaire' :
                  sellerType === 'seller' ? 'Vendeur' :
                  sellerType === 'agent' ? 'Agent' :
                  'Propriétaire'
                }
              </div>
            )}
          </div>
          <Button 
            variant="default"
            className="h-11 md:h-10"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Voir détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
