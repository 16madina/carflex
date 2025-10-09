import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, []);

  const checkAuthAndFetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    fetchFavorites(user.id);
  };

  const fetchFavorites = async (userId: string) => {
    setLoading(true);

    const { data: favoritesData, error: favError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .eq("listing_type", "sale");

    if (favError) {
      console.error("Error fetching favorites:", favError);
      toast.error("Erreur lors du chargement des favoris");
      setLoading(false);
      return;
    }

    if (!favoritesData || favoritesData.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const listingIds = favoritesData.map(fav => fav.listing_id);

    const { data: listingsData, error: listError } = await supabase
      .from("sale_listings")
      .select("*")
      .in("id", listingIds);

    if (listError) {
      console.error("Error fetching listings:", listError);
      toast.error("Erreur lors du chargement des annonces");
    } else {
      setFavorites(listingsData || []);
    }

    setLoading(false);
  };

  const handleFavoriteToggle = () => {
    // Refresh the list when a favorite is removed
    checkAuthAndFetchFavorites();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mes Favoris</h1>
          <p className="text-muted-foreground">
            Retrouvez tous vos véhicules favoris
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de favoris
            </p>
            <Button onClick={() => navigate("/listings")}>
              Découvrir les annonces
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((listing) => (
              <CarCard
                key={listing.id}
                id={listing.id}
                brand={listing.brand}
                model={listing.model}
                year={listing.year}
                price={listing.price}
                mileage={listing.mileage}
                city={listing.city}
                transmission={listing.transmission === "automatic" ? "Automatique" : "Manuelle"}
                image={Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : undefined}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Favorites;
