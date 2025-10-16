import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFavorites = (listingId?: string, listingType: "sale" | "rental" = "sale") => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listingId) {
      checkFavorite();
    }
  }, [listingId, listingType]);

  const checkFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !listingId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .eq("listing_type", listingType)
        .maybeSingle();

      if (error) {
        console.error("Error checking favorite:", error);
      } else {
        setIsFavorite(!!data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter aux favoris");
        return;
      }

      if (!listingId) return;

      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .eq("listing_type", listingType);

        if (error) {
          toast.error("Erreur lors du retrait des favoris");
          console.error("Error removing favorite:", error);
        } else {
          setIsFavorite(false);
          toast.success("Retiré des favoris");
        }
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            listing_id: listingId,
            listing_type: listingType
          });

        if (error) {
          toast.error("Erreur lors de l'ajout aux favoris");
          console.error("Error adding favorite:", error);
        } else {
          setIsFavorite(true);
          toast.success("Ajouté aux favoris");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Une erreur est survenue");
    }
  };

  return { isFavorite, loading, toggleFavorite };
};
