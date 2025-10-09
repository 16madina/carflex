import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Listings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    
    let query = supabase
      .from("sale_listings")
      .select("*")
      .order(sortBy, { ascending: sortBy === "price" });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching listings:", error);
    } else {
      setListings(data || []);
    }

    setLoading(false);
  };

  const filteredListings = listings.filter((listing) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      listing.brand.toLowerCase().includes(searchLower) ||
      listing.model.toLowerCase().includes(searchLower) ||
      listing.city.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Acheter un véhicule</h1>
          <p className="text-muted-foreground">
            Découvrez notre sélection de véhicules à vendre
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par marque, modèle, ville..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trier par</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Plus récent</SelectItem>
                      <SelectItem value="price">Prix croissant</SelectItem>
                      <SelectItem value="mileage">Kilométrage</SelectItem>
                      <SelectItem value="year">Année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des annonces...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aucun véhicule trouvé</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Réinitialiser la recherche
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
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
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Listings;
