import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import PremiumCarCard from "@/components/PremiumCarCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdvancedFilters, { FilterState } from "@/components/AdvancedFilters";

const Index = () => {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [rentalCars, setRentalCars] = useState<any[]>([]);
  const [premiumCars, setPremiumCars] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [filters, setFilters] = useState<FilterState>({
    priceMin: "",
    priceMax: "",
    mileageMin: "",
    mileageMax: "",
    yearMin: "",
    yearMax: "",
    fuelType: "all",
    transmission: "all",
    budgetMax: "",
    sortBy: "created_at",
  });

  useEffect(() => {
    const fetchCars = async () => {
      // Fetch premium listings with a direct join
      const { data: premiumData, error: premiumError } = await supabase
        .from("premium_listings")
        .select(`
          listing_id,
          sale_listings!inner (
            id,
            brand,
            model,
            year,
            price,
            mileage,
            city,
            country,
            transmission,
            fuel_type,
            images,
            seller_id,
            profiles!sale_listings_seller_id_fkey (
              first_name,
              last_name,
              user_type
            )
          )
        `)
        .eq("is_active", true)
        .eq("listing_type", "sale")
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(4);

      if (premiumError) {
        console.error("Error fetching premium listings:", premiumError);
      }

      if (premiumData && premiumData.length > 0) {
        console.log("Premium data:", premiumData);
        const premiumListings = premiumData
          .map((p: any) => {
            const saleListing = p.sale_listings;
            // Extract profile data from nested structure
            if (saleListing && saleListing.profiles) {
              return {
                ...saleListing,
                profiles: saleListing.profiles
              };
            }
            return saleListing;
          })
          .filter((car: any) => car !== null);
        console.log("Processed premium listings:", premiumListings);
        setPremiumCars(premiumListings);
      }

      // Fetch latest cars (show all recent cars, not just featured)
      const { data: latestData } = await supabase
        .from("sale_listings")
        .select(`
          *,
          profiles!sale_listings_seller_id_fkey (
            first_name,
            last_name,
            user_type
          )
        `)
        .order(sortBy === "price" ? "price" : "created_at", { ascending: sortBy === "price" })
        .limit(6);

      console.log("Latest cars with profiles:", latestData);
      setFeaturedCars(latestData || []);

      // Fetch rental cars
      const { data: rentalData } = await supabase
        .from("rental_listings")
        .select(`
          *,
          profiles!rental_listings_owner_id_fkey (
            first_name,
            last_name,
            user_type
          )
        `)
        .eq("available", true)
        .order(sortBy === "price_per_day" ? "price_per_day" : "created_at", { ascending: sortBy === "price" })
        .limit(6);

      console.log("Rental cars with profiles:", rentalData);
      setRentalCars(rentalData || []);
    };

    fetchCars();
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <Hero />

      {/* Premium Listings Section */}
      {premiumCars.length > 0 && (
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Annonces Premium</h2>
              <Button variant="link" asChild className="text-primary">
                <Link to="/listings">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4 pb-4" style={{ width: 'max-content' }}>
              {premiumCars.map((car) => (
                <div key={car.id} className="w-[280px] md:w-[320px] flex-shrink-0">
                  <PremiumCarCard
                    id={car.id}
                    brand={car.brand}
                    model={car.model}
                    year={car.year}
                    price={car.price}
                    mileage={car.mileage}
                    city={car.city}
                    country={car.country}
                    transmission={car.transmission}
                    fuel_type={car.fuel_type}
                    images={Array.isArray(car.images) ? car.images : []}
                    priceQuality="good"
                    sellerName={car.profiles ? `${car.profiles.first_name} ${car.profiles.last_name}` : undefined}
                    sellerType={car.profiles?.user_type}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Cars Section with Tabs */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Véhicules en vedette</h2>
            <p className="text-muted-foreground">
              Découvrez notre sélection des meilleures offres
            </p>
          </div>
        </div>

        <Tabs defaultValue="sale" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="sale">Vente</TabsTrigger>
              <TabsTrigger value="rental">Location</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <AdvancedFilters
                listingType="sale"
                filters={filters}
                onFiltersChange={setFilters}
                onSortChange={setSortBy}
                sortBy={sortBy}
              />
              <Button variant="outline" asChild>
                <Link to="/listings">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <TabsContent value="sale">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.filter((car) => {
                const matchesPrice = 
                  (!filters.priceMin || car.price >= parseInt(filters.priceMin)) &&
                  (!filters.priceMax || car.price <= parseInt(filters.priceMax));
                const matchesMileage = 
                  (!filters.mileageMin || car.mileage >= parseInt(filters.mileageMin)) &&
                  (!filters.mileageMax || car.mileage <= parseInt(filters.mileageMax));
                const matchesYear = 
                  (!filters.yearMin || car.year >= parseInt(filters.yearMin)) &&
                  (!filters.yearMax || car.year <= parseInt(filters.yearMax));
                const matchesFuel = filters.fuelType === "all" || car.fuel_type === filters.fuelType;
                const matchesTransmission = filters.transmission === "all" || car.transmission === filters.transmission;
                const matchesBudget = !filters.budgetMax || car.price <= parseInt(filters.budgetMax);
                
                return matchesPrice && matchesMileage && matchesYear && matchesFuel && matchesTransmission && matchesBudget;
              }).map((car) => (
                <CarCard
                  key={car.id}
                  id={car.id}
                  brand={car.brand}
                  model={car.model}
                  year={car.year}
                  price={car.price}
                  mileage={car.mileage}
                  city={car.city}
                  transmission={car.transmission === "automatic" ? "Automatique" : "Manuelle"}
                  images={Array.isArray(car.images) ? car.images : []}
                  sellerName={car.profiles ? `${car.profiles.first_name} ${car.profiles.last_name}` : undefined}
                  sellerType={car.profiles?.user_type}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rental">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentalCars.filter((car) => {
                const matchesPrice = 
                  (!filters.priceMin || car.price_per_day >= parseInt(filters.priceMin)) &&
                  (!filters.priceMax || car.price_per_day <= parseInt(filters.priceMax));
                const matchesMileage = 
                  (!filters.mileageMin || car.mileage >= parseInt(filters.mileageMin)) &&
                  (!filters.mileageMax || car.mileage <= parseInt(filters.mileageMax));
                const matchesYear = 
                  (!filters.yearMin || car.year >= parseInt(filters.yearMin)) &&
                  (!filters.yearMax || car.year <= parseInt(filters.yearMax));
                const matchesFuel = filters.fuelType === "all" || car.fuel_type === filters.fuelType;
                const matchesTransmission = filters.transmission === "all" || car.transmission === filters.transmission;
                
                return matchesPrice && matchesMileage && matchesYear && matchesFuel && matchesTransmission;
              }).map((car) => (
                <CarCard
                  key={car.id}
                  id={car.id}
                  brand={car.brand}
                  model={car.model}
                  year={car.year}
                  price={car.price_per_day}
                  mileage={car.mileage}
                  city={car.city}
                  transmission={car.transmission === "automatic" ? "Automatique" : "Manuelle"}
                  images={Array.isArray(car.images) ? car.images : []}
                  isRental={true}
                  sellerName={car.profiles ? `${car.profiles.first_name} ${car.profiles.last_name}` : undefined}
                  sellerType={car.profiles?.user_type}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
