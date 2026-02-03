import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Favorite {
  id: string;
  listing_id: string;
  listing_type: string;
}

export const useFavoritesList = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id, listing_id, listing_type")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching favorites:", error);
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (listingId: string, listingType: "sale" | "rental") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter aux favoris");
        return;
      }

      const existingFavorite = favorites.find(
        f => f.listing_id === listingId && f.listing_type === listingType
      );

      if (existingFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existingFavorite.id);

        if (error) {
          toast.error("Erreur lors du retrait des favoris");
          console.error("Error removing favorite:", error);
        } else {
          setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
          toast.success("Retiré des favoris");
        }
      } else {
        const { data, error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            listing_id: listingId,
            listing_type: listingType
          })
          .select("id, listing_id, listing_type")
          .single();

        if (error) {
          toast.error("Erreur lors de l'ajout aux favoris");
          console.error("Error adding favorite:", error);
        } else if (data) {
          setFavorites(prev => [...prev, data]);
          toast.success("Ajouté aux favoris");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const isFavorite = (listingId: string) => {
    return favorites.some(f => f.listing_id === listingId);
  };

  return { favorites, loading, toggleFavorite, isFavorite };
};
