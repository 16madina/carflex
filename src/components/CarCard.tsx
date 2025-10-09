import { Heart, MapPin, Calendar, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/contexts/CountryContext";

interface CarCardProps {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  image?: string;
  transmission: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  isRental?: boolean;
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
  transmission,
  isFavorite = false,
  onFavoriteToggle,
  isRental = false,
}: CarCardProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();

  const handleCardClick = () => {
    navigate(`/listing/${id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-card flex items-center justify-center">
            <span className="text-muted-foreground">Image non disponible</span>
          </div>
        )}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 rounded-full shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.();
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
        </Button>
      </div>

      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-xl mb-1">
            {brand} {model}
          </h3>
          <Badge variant="secondary">{transmission}</Badge>
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
            <span className="text-2xl font-bold text-accent">
              {formatPrice(price)}
            </span>
            {isRental && (
              <span className="text-sm text-muted-foreground ml-1">/jour</span>
            )}
          </div>
          <Button 
            variant="default"
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
