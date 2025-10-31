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
    <Card className="overflow-hidden hover:shadow-native-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl active-press-sm">
      <div className="relative rounded-t-3xl overflow-hidden">
        <ImageCarousel 
          images={images.length > 0 ? images : ["/placeholder.svg"]} 
          alt={`${brand} ${model}`}
          showNavigation={false}
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold flex items-center gap-1.5 rounded-xl px-4 py-2 shadow-lg shadow-amber-500/30 backdrop-blur-md border border-white/20">
            <Zap className="h-4 w-4" />
            Premium
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="glass-native h-12 w-12 rounded-full shadow-native-lg active-press"
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

      <CardContent className="p-6">
        <h3 className="font-bold text-xl mb-2 leading-tight">
          {year} {brand} {model}
        </h3>
        <p className={`text-2xl font-bold ${getPriceColorClass(rating)} mb-2`}>
          {formatPrice(price)}
        </p>
        {sellerName && sellerType && (
          <div className="text-sm text-muted-foreground mb-4">
            {sellerName} • {
              sellerType === 'dealer' ? 'Concessionnaire' :
              sellerType === 'seller' ? 'Vendeur' :
              sellerType === 'agent' ? 'Agent' :
              'Propriétaire'
            }
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">{city}</span>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground mb-5 font-medium">
          <span>{mileage.toLocaleString()} km</span>
          <span>•</span>
          <span className="capitalize">{transmission}</span>
          <span>•</span>
          <span className="capitalize">{fuel_type}</span>
        </div>
        <Button
          className="w-full rounded-xl py-3.5 font-semibold shadow-md active:shadow-sm active-press"
          onClick={() => navigate(`/listing/${id}`)}
        >
          Voir détails
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumCarCard;
