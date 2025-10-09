import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface AddReviewProps {
  listingId: string;
  onReviewAdded: () => void;
}

const AddReview = ({ listingId, onReviewAdded }: AddReviewProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .insert({
          listing_id: listingId,
          reviewer_id: user.id,
          rating,
          comment: comment.trim() || null
        });

      if (error) throw error;

      toast.success("Avis ajouté avec succès");
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Erreur lors de l'ajout de l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laisser un avis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i < (hoveredRating || rating)
                        ? "fill-accent text-accent"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Commentaire (optionnel)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting || rating === 0}>
            {submitting ? "Envoi en cours..." : "Publier l'avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddReview;
