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

    try {
      console.log("Fetching favorites for user:", userId);
      
      const { data: favoritesData, error: favError } = await supabase
        .from("favorites")
        .select("listing_id, listing_type")
        .eq("user_id", userId);

      console.log("Favorites data:", favoritesData);

      if (favError) {
        console.error("Error fetching favorites:", favError);
        toast.error("Erreur lors du chargement des favoris");
        setLoading(false);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        console.log("No favorites found");
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Séparer les favoris par type
      const saleFavorites = favoritesData
        .filter(fav => fav.listing_type === "sale")
        .map(fav => fav.listing_id);
      
      const rentalFavorites = favoritesData
        .filter(fav => fav.listing_type === "rental")
        .map(fav => fav.listing_id);

      const allListings: any[] = [];

      // Récupérer les annonces de vente
      if (saleFavorites.length > 0) {
        const { data: saleListings, error: saleError } = await supabase
          .from("sale_listings")
          .select("*")
          .in("id", saleFavorites);

        if (saleError) {
          console.error("Error fetching sale listings:", saleError);
        } else if (saleListings) {
          console.log("Sale listings found:", saleListings.length);
          allListings.push(...saleListings.map(l => ({ ...l, listing_type: 'sale' })));
        }
      }

      // Récupérer les annonces de location
      if (rentalFavorites.length > 0) {
        const { data: rentalListings, error: rentalError } = await supabase
          .from("rental_listings")
          .select("*")
          .in("id", rentalFavorites);

        if (rentalError) {
          console.error("Error fetching rental listings:", rentalError);
        } else if (rentalListings) {
          console.log("Rental listings found:", rentalListings.length);
          allListings.push(...rentalListings.map(l => ({ ...l, listing_type: 'rental' })));
        }
      }

      console.log("Total listings found:", allListings.length);
      setFavorites(allListings);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    // Refresh the list when a favorite is removed
    checkAuthAndFetchFavorites();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6 pt-24">
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
                price={listing.price || listing.price_per_day}
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
