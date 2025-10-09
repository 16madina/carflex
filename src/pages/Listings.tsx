import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const Listings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  
  // Advanced filters
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    mileageMin: "",
    mileageMax: "",
    yearMin: "",
    yearMax: "",
    fuelType: "all",
    transmission: "all",
    city: "",
    country: ""
  });

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
    const matchesSearch = 
      listing.brand.toLowerCase().includes(searchLower) ||
      listing.model.toLowerCase().includes(searchLower) ||
      listing.city.toLowerCase().includes(searchLower);

    const matchesPrice = 
      (!filters.priceMin || listing.price >= parseInt(filters.priceMin)) &&
      (!filters.priceMax || listing.price <= parseInt(filters.priceMax));

    const matchesMileage = 
      (!filters.mileageMin || listing.mileage >= parseInt(filters.mileageMin)) &&
      (!filters.mileageMax || listing.mileage <= parseInt(filters.mileageMax));

    const matchesYear = 
      (!filters.yearMin || listing.year >= parseInt(filters.yearMin)) &&
      (!filters.yearMax || listing.year <= parseInt(filters.yearMax));

    const matchesFuel = filters.fuelType === "all" || listing.fuel_type === filters.fuelType;
    const matchesTransmission = filters.transmission === "all" || listing.transmission === filters.transmission;
    const matchesCity = !filters.city || listing.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesCountry = !filters.country || listing.country.toLowerCase().includes(filters.country.toLowerCase());

    return matchesSearch && matchesPrice && matchesMileage && matchesYear && 
           matchesFuel && matchesTransmission && matchesCity && matchesCountry;
  });

  const resetFilters = () => {
    setFilters({
      priceMin: "",
      priceMax: "",
      mileageMin: "",
      mileageMax: "",
      yearMin: "",
      yearMax: "",
      fuelType: "all",
      transmission: "all",
      city: "",
      country: ""
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "fuelType" || key === "transmission") return value !== "all";
    return value !== "";
  }).length;

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
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>Filtres avancés</SheetTitle>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Sort */}
                <div className="space-y-2">
                  <Label>Trier par</Label>
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

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Prix (€)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Mileage Range */}
                <div className="space-y-2">
                  <Label>Kilométrage (km)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.mileageMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, mileageMin: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.mileageMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, mileageMax: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div className="space-y-2">
                  <Label>Année</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.yearMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, yearMin: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.yearMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, yearMax: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="space-y-2">
                  <Label>Carburant</Label>
                  <Select value={filters.fuelType} onValueChange={(value) => setFilters(prev => ({ ...prev, fuelType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="gasoline">Essence</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Électrique</SelectItem>
                      <SelectItem value="hybrid">Hybride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transmission */}
                <div className="space-y-2">
                  <Label>Transmission</Label>
                  <Select value={filters.transmission} onValueChange={(value) => setFilters(prev => ({ ...prev, transmission: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="automatic">Automatique</SelectItem>
                      <SelectItem value="manual">Manuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    placeholder="Ex: Paris"
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input
                    placeholder="Ex: France"
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  />
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
