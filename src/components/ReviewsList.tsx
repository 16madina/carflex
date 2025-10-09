import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
}

interface ReviewsListProps {
  sellerId: string;
}

const ReviewsList = ({ sellerId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      // Get all listings by this seller
      const { data: listings } = await supabase
        .from("sale_listings")
        .select("id")
        .eq("seller_id", sellerId);

      if (!listings || listings.length === 0) {
        setLoading(false);
        return;
      }

      const listingIds = listings.map(l => l.id);

      // Get reviews for these listings
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
        
        // Calculate average rating
        if (data && data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground">Chargement des avis...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-center text-muted-foreground">Aucun avis pour ce vendeur</p>;
  }

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-accent text-accent" />
          <span className="text-2xl font-bold">{averageRating}</span>
        </div>
        <span className="text-muted-foreground">
          ({reviews.length} {reviews.length === 1 ? "avis" : "avis"})
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-accent text-accent"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "dd MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
