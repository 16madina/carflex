import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DealRatingBadgeProps {
  listingId: string;
  listingType?: "sale" | "rental";
  showDetails?: boolean;
  onRatingCalculated?: (rating: "excellent" | "good" | "fair" | "poor") => void;
}

interface DealRating {
  dealRating: "excellent" | "good" | "fair" | "poor";
  savingsPercentage: number;
  marketAverage: number;
  explanation: string;
  comparableCount: number;
}

const DealRatingBadge = ({ 
  listingId, 
  listingType = "sale",
  showDetails = false,
  onRatingCalculated
}: DealRatingBadgeProps) => {
  const [rating, setRating] = useState<DealRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealRating();
  }, [listingId]);

  const fetchDealRating = async () => {
    try {
      // Use AI-powered evaluation
      const { data, error } = await supabase.functions.invoke("ai-price-evaluation", {
        body: { listingId, listingType }
      });

      if (error) throw error;
      setRating(data);
      if (data?.dealRating) {
        onRatingCalculated?.(data.dealRating);
      }
    } catch (error) {
      console.error("Error fetching AI price evaluation:", error);
      // Fallback to basic calculation if AI fails
      try {
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke("calculate-deal-rating", {
          body: { listingId, listingType }
        });
        if (!fallbackError) {
          setRating(fallbackData);
          if (fallbackData?.dealRating) {
            onRatingCalculated?.(fallbackData.dealRating);
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (!rating) {
    return null;
  }

  // Show badge even with few comparables, but with different messaging
  const hasEnoughData = rating.comparableCount >= 3;

  const config = {
    excellent: {
      label: "Excellent prix",
      color: "bg-green-500 hover:bg-green-600 text-white",
      icon: TrendingDown
    },
    good: {
      label: "Bon prix",
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      icon: TrendingDown
    },
    fair: {
      label: "Prix correct",
      color: "bg-amber-500 hover:bg-amber-600 text-white",
      icon: Minus
    },
    poor: {
      label: "Prix élevé",
      color: "bg-orange-500 hover:bg-orange-600 text-white",
      icon: TrendingUp
    }
  };

  const { label, color, icon: Icon } = config[rating.dealRating];

  const badge = (
    <Badge className={`${color} font-medium flex items-center gap-1 shadow-lg`}>
      <Icon className="h-3 w-3" />
      {label}
      {rating.savingsPercentage !== 0 && (
        <span className="ml-1">
          {rating.savingsPercentage > 0 ? '-' : '+'}{Math.abs(rating.savingsPercentage)}%
        </span>
      )}
      {(rating as any).aiPowered && (
        <Sparkles className="h-3 w-3 ml-1" />
      )}
    </Badge>
  );

  const tooltipContent = hasEnoughData ? (
    <>
      <p className="text-sm">{rating.explanation}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Basé sur {rating.comparableCount} annonces similaires
      </p>
    </>
  ) : (
    <>
      <p className="text-sm">{rating.explanation}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Données limitées ({rating.comparableCount} annonces)
      </p>
    </>
  );

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {badge}
      {showDetails && (
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">{rating.explanation}</p>
          <p className="text-xs text-muted-foreground">
            {hasEnoughData 
              ? `Basé sur ${rating.comparableCount} annonces similaires`
              : `Données limitées (${rating.comparableCount} annonces)`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DealRatingBadge;
