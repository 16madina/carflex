import { useState } from "react";
import { Heart, MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/contexts/CountryContext";
import ImageCarousel from "@/components/ImageCarousel";
import DealRatingBadge from "@/components/DealRatingBadge";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card 
        className="overflow-hidden shadow-material hover:shadow-material-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => navigate(`/listing/${id}`)}
      >
      <div className="relative h-48 bg-muted">
        {images.length > 0 ? (
          <ImageCarousel 
            images={images} 
            alt={`${brand} ${model}`}
            showNavigation={false}
          />
        ) : (
          <Skeleton className="w-full h-48" />
        )}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-material glass-morphism text-xs">
            <Zap className="h-3.5 w-3.5" />
            Premium
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="glass-morphism hover:bg-background/90 h-12 w-12 rounded-full shadow-material-lg hover:scale-110"
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

      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2">
          {year} {brand} {model}
        </h3>
        <p className={`text-xl font-bold ${getPriceColorClass(rating)} mb-2`}>
          {formatPrice(price)}
        </p>
        {sellerName && sellerType && (
          <div className="text-[10px] text-muted-foreground mb-3">
            {sellerName} • {
              sellerType === 'dealer' ? 'Concessionnaire' :
              sellerType === 'seller' ? 'Vendeur' :
              sellerType === 'agent' ? 'Agent' :
              'Propriétaire'
            }
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>{city}</span>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground mb-4">
          <span>{mileage.toLocaleString()} km</span>
          <span>•</span>
          <span className="capitalize">{transmission}</span>
          <span>•</span>
          <span className="capitalize">{fuel_type}</span>
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={() => navigate(`/listing/${id}`)}
        >
          Voir détails
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default PremiumCarCard;
