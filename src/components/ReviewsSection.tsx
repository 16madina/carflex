import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, User as UserIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
}

interface ReviewsWithStats {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

interface ReviewsSectionProps {
  listingId: string;
  sellerId?: string;
}

const ReviewsSection = ({ listingId, sellerId }: ReviewsSectionProps) => {
  const [data, setData] = useState<ReviewsWithStats>({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [listingId, sellerId]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (sellerId) {
        // Get all listings by this seller
        const { data: listings } = await supabase
          .from("sale_listings")
          .select("id")
          .eq("seller_id", sellerId);

        if (listings && listings.length > 0) {
          const listingIds = listings.map(l => l.id);
          query = query.in("listing_id", listingIds);
        }
      } else {
        query = query.eq("listing_id", listingId);
      }

      const { data: reviews, error } = await query;

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        // Calculate statistics
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        setData({
          reviews,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length,
          ratingDistribution: distribution
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground">Chargement des avis...</p>;
  }

  if (data.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Aucun avis pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Avis des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-card rounded-lg">
              <div className="text-5xl font-bold mb-2">{data.averageRating}</div>
              <div className="flex mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(data.averageRating)
                        ? "fill-accent text-accent"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Basé sur {data.totalReviews} {data.totalReviews === 1 ? "avis" : "avis"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = data.ratingDistribution[stars] || 0;
                const percentage = data.totalReviews > 0 
                  ? (count / data.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="h-3 w-3 fill-accent text-accent" />
                    </div>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {data.reviews.map((review) => (
          <Card key={review.id} className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <UserIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                      <span className="text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "dd MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
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

export default ReviewsSection;
