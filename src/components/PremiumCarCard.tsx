import { useState } from "react";
import { Heart, MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/contexts/CountryContext";
import ImageCarousel from "@/components/ImageCarousel";
import DealRatingBadge from "@/components/DealRatingBadge";

interface PremiumCarCardProps {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
  country: string;
  mileage: number;
  transmission: string;
  fuel_type: string;
  images: string[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  priceQuality?: "excellent" | "good" | "fair";
  sellerName?: string;
  sellerType?: string;
}

const PremiumCarCard = ({
  id,
  brand,
  model,
  year,
  price,
  city,
  country,
  mileage,
  transmission,
  fuel_type,
  images,
  isFavorite,
  onToggleFavorite,
  priceQuality = "good",
  sellerName,
  sellerType,
}: PremiumCarCardProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [rating, setRating] = useState<string | null>(null);

  const priceQualityConfig = {
    excellent: { label: "Excellent prix", color: "bg-green-500" },
    good: { label: "Bon prix", color: "bg-blue-500" },
    fair: { label: "Prix correct", color: "bg-amber-500" },
  };

  const qualityInfo = priceQualityConfig[priceQuality];

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
        return 'text-primary';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <ImageCarousel 
          images={images.length > 0 ? images : ["/placeholder.svg"]} 
          alt={`${brand} ${model}`}
          showNavigation={false}
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Premium
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 hover:bg-background h-11 w-11 md:h-10 md:w-10"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <DealRatingBadge 
            listingId={id} 
            listingType="sale"
            onRatingCalculated={setRating}
          />
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {year} {brand} {model}
        </h3>
        <p className={`text-2xl font-bold ${getPriceColorClass(rating)} mb-1`}>
          {formatPrice(price)}
        </p>
        {sellerName && sellerType && (
          <div className="text-xs text-muted-foreground mb-3">
            {sellerName} • {
              sellerType === 'dealer' ? 'Concessionnaire' :
              sellerType === 'seller' ? 'Vendeur' :
              sellerType === 'agent' ? 'Agent' :
              'Propriétaire'
            }
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span>{city}</span>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground mb-4">
          <span>{mileage.toLocaleString()} km</span>
          <span>•</span>
          <span className="capitalize">{transmission}</span>
          <span>•</span>
          <span className="capitalize">{fuel_type}</span>
        </div>
        <Button
          className="w-full h-11 md:h-10"
          onClick={() => navigate(`/listing/${id}`)}
        >
          Voir détails
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumCarCard;
