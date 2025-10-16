import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CarCard from "@/components/CarCard";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BODY_TYPES, VEHICLE_CATEGORIES, POPULAR_CITIES } from "@/constants/vehicles";
import BudgetCalculator from "@/components/BudgetCalculator";
import { useCountry } from "@/contexts/CountryContext";

const Listings = () => {
  const [listingType, setListingType] = useState<"sale" | "rental">("sale");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  
  const { selectedCountry } = useCountry();
  
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
    country: "all",
    bodyType: "all",
    category: "all",
    budgetMax: ""
  });

  // Sync country filter with selectedCountry
  useEffect(() => {
    setFilters(prev => ({ ...prev, country: selectedCountry.name }));
  }, [selectedCountry]);

  useEffect(() => {
    fetchListings();
  }, [sortBy, listingType, selectedCountry]);

  const fetchListings = async () => {
    setLoading(true);
    
    const tableName = listingType === "sale" ? "sale_listings" : "rental_listings";
    const priceField = listingType === "sale" ? "price" : "price_per_day";
    const orderField = sortBy === "price" ? priceField : sortBy;
    
    let query = supabase
      .from(tableName)
      .select("*")
      .eq("country", selectedCountry.name)
      .order(orderField, { ascending: sortBy === "price" || sortBy === "price_per_day" });

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

    const priceValue = listingType === "sale" ? listing.price : listing.price_per_day;
    const matchesPrice = 
      (!filters.priceMin || priceValue >= parseInt(filters.priceMin)) &&
      (!filters.priceMax || priceValue <= parseInt(filters.priceMax));

    const matchesMileage = 
      (!filters.mileageMin || listing.mileage >= parseInt(filters.mileageMin)) &&
      (!filters.mileageMax || listing.mileage <= parseInt(filters.mileageMax));

    const matchesYear = 
      (!filters.yearMin || listing.year >= parseInt(filters.yearMin)) &&
      (!filters.yearMax || listing.year <= parseInt(filters.yearMax));

    const matchesFuel = filters.fuelType === "all" || listing.fuel_type === filters.fuelType;
    const matchesTransmission = filters.transmission === "all" || listing.transmission === filters.transmission;
    const matchesCity = !filters.city || listing.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesCountry = filters.country === "all" || listing.country.toLowerCase().includes(filters.country.toLowerCase());
    const matchesBodyType = filters.bodyType === "all" || !listing.body_type || listing.body_type === filters.bodyType;
    
    const matchesBudget = !filters.budgetMax || priceValue <= parseInt(filters.budgetMax);
    
    const matchesCategory = filters.category === "all" || (() => {
      switch (filters.category) {
        case "economique":
          return priceValue < 10000000 && listing.fuel_type !== "gasoline";
        case "sportive":
          return listing.horsepower > 200 || listing.body_type === "Coupé";
        case "awd":
          return listing.features?.includes("AWD") || listing.features?.includes("4WD");
        case "4x4":
          return listing.body_type === "4x4" || listing.body_type === "SUV" || listing.body_type === "Pick-up";
        case "electrique":
          return listing.fuel_type === "electric" || listing.fuel_type === "hybrid";
        case "petit_camion":
          return listing.body_type === "Pick-up";
        default:
          return true;
      }
    })();

    return matchesSearch && matchesPrice && matchesMileage && matchesYear && 
           matchesFuel && matchesTransmission && matchesCity && matchesCountry && 
           matchesBodyType && matchesBudget && matchesCategory;
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
      country: "all",
      bodyType: "all",
      category: "all",
      budgetMax: ""
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "fuelType" || key === "transmission" || key === "bodyType" || key === "category") return value !== "all";
    return value !== "";
  }).length;

  const handleBudgetChange = (maxPrice: number) => {
    setFilters(prev => ({ ...prev, budgetMax: maxPrice.toString() }));
  };

  const handleCitySelect = (city: string) => {
    setFilters(prev => ({ ...prev, city }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={listingType} onValueChange={(value) => setListingType(value as "sale" | "rental")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="sale">Acheter</TabsTrigger>
            <TabsTrigger value="rental">Louer</TabsTrigger>
          </TabsList>

          <TabsContent value={listingType} className="mt-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {listingType === "sale" ? "Acheter un véhicule" : "Louer un véhicule"}
              </h1>
              <p className="text-muted-foreground">
                {listingType === "sale" 
                  ? "Découvrez notre sélection de véhicules à vendre"
                  : "Découvrez notre sélection de véhicules à louer"}
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
                {listingType === "sale" && (
                  <BudgetCalculator onBudgetChange={handleBudgetChange} />
                )}

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

                <div className="space-y-2">
                  <Label>{listingType === "sale" ? "Prix" : "Prix par jour"}</Label>
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

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {VEHICLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type de carrosserie</Label>
                  <Select value={filters.bodyType} onValueChange={(value) => setFilters(prev => ({ ...prev, bodyType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {BODY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    placeholder="Ex: Abidjan"
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  />
                  
                  {POPULAR_CITIES[selectedCountry.code] && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {POPULAR_CITIES[selectedCountry.code].map((city) => (
                        <Button
                          key={city}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCitySelect(city)}
                          className={filters.city === city ? "bg-primary text-primary-foreground" : ""}
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                      <SelectItem value="Mali">Mali</SelectItem>
                      <SelectItem value="Sénégal">Sénégal</SelectItem>
                      <SelectItem value="Bénin">Bénin</SelectItem>
                      <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                      <SelectItem value="Togo">Togo</SelectItem>
                      <SelectItem value="Guinée-Bissau">Guinée-Bissau</SelectItem>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Guinée">Guinée</SelectItem>
                      <SelectItem value="Maroc">Maroc</SelectItem>
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
            {filteredListings.map((listing, index) => (
              <>
                <CarCard
                  key={listing.id}
                  id={listing.id}
                  brand={listing.brand}
                  model={listing.model}
                  year={listing.year}
                  price={listingType === "sale" ? listing.price : listing.price_per_day}
                  mileage={listing.mileage}
                  city={listing.city}
                  transmission={listing.transmission === "automatic" ? "Automatique" : "Manuelle"}
                  images={Array.isArray(listing.images) ? listing.images : []}
                  isRental={listingType === "rental"}
                />
                {/* Insérer une bannière toutes les 5 annonces */}
                {(index + 1) % 5 === 0 && index < filteredListings.length - 1 && (
                  <AdBanner key={`ad-${index}`} />
                )}
              </>
            ))}
          </div>
        )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Listings;
