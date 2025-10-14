import { Heart, MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/contexts/CountryContext";
import ImageCarousel from "@/components/ImageCarousel";

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

  const priceQualityConfig = {
    excellent: { label: "Excellent prix", color: "bg-green-500" },
    good: { label: "Bon prix", color: "bg-blue-500" },
    fair: { label: "Prix correct", color: "bg-amber-500" },
  };

  const qualityInfo = priceQualityConfig[priceQuality];

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
            className="bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <Badge className={`${qualityInfo.color} text-white font-medium`}>
            {qualityInfo.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {year} {brand} {model}
        </h3>
        {sellerName && sellerType && (
          <Badge variant="outline" className="text-xs mb-2">
            {sellerName} • {
              sellerType === 'dealer' ? 'Concessionnaire' :
              sellerType === 'seller' ? 'Vendeur' :
              sellerType === 'agent' ? 'Agent' :
              'Propriétaire'
            }
          </Badge>
        )}
        <p className="text-2xl font-bold text-primary mb-3">
          {formatPrice(price)}
        </p>
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
          className="w-full"
          onClick={() => navigate(`/listing/${id}`)}
        >
          Voir détails
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumCarCard;
