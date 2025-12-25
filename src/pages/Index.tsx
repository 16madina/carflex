import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import PremiumCarCard from "@/components/PremiumCarCard";
import ProPlanPromo from "@/components/ProPlanPromo";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdvancedFilters, { FilterState } from "@/components/AdvancedFilters";
import { useCountry } from "@/contexts/CountryContext";
import { Skeleton } from "@/components/ui/skeleton";

// Helper: execute Supabase query as a proper Promise (fixes iOS hang issues)
const executeQuery = async <T,>(queryBuilder: PromiseLike<T>): Promise<T> => {
  return Promise.resolve(queryBuilder);
};

// Helper: timeout wrapper for promises (prevents infinite loading on iOS)
const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
};

const Index = () => {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [rentalCars, setRentalCars] = useState<any[]>([]);
  const [premiumCars, setPremiumCars] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [userFirstName, setUserFirstName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const { selectedCountry } = useCountry();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.first_name) {
            setUserFirstName(profile.first_name);
          }
        }
      } catch (e) {
        console.error('[Index] fetchUserProfile error:', e);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      console.log('[Index] fetchCars started');
      setLoading(true);
      setError(null);

      try {
        // Fetch premium sale listings with JOIN (with timeout)
        const premiumSaleResult = await withTimeout(
          executeQuery(
            supabase
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
              .eq("sale_listings.country", selectedCountry.name)
              .gte("end_date", new Date().toISOString())
              .order("created_at", { ascending: false })
              .limit(4)
          ),
          10000,
          'premiumSale'
        );
        const premiumSaleData = premiumSaleResult.data;
        const premiumSaleError = premiumSaleResult.error;

        // Fetch premium rental IDs separately (with timeout)
        const premiumRentalResult = await withTimeout(
          executeQuery(
            supabase
              .from("premium_listings")
              .select("listing_id")
              .eq("is_active", true)
              .eq("listing_type", "rental")
              .gte("end_date", new Date().toISOString())
              .order("created_at", { ascending: false })
              .limit(4)
          ),
          10000,
          'premiumRentalIds'
        );
        const premiumRentalIds = premiumRentalResult.data;
        const premiumRentalIdsError = premiumRentalResult.error;

        if (premiumSaleError) {
          console.error("Error fetching premium sale listings:", premiumSaleError);
        }
        if (premiumRentalIdsError) {
          console.error("Error fetching premium rental IDs:", premiumRentalIdsError);
        }

        // Process premium sale listings
        const premiumSaleListings = (premiumSaleData || [])
          .map((p: any) => {
            const saleListing = p.sale_listings;
            if (saleListing && saleListing.profiles) {
              return {
                ...saleListing,
                profiles: saleListing.profiles,
                listing_type: 'sale'
              };
            }
            return null;
          })
          .filter((car: any) => car !== null);

        // Fetch rental listings details separately
        let premiumRentalListings: any[] = [];
        if (premiumRentalIds && premiumRentalIds.length > 0) {
          const rentalIds = premiumRentalIds.map(p => p.listing_id);
          const rentalResult = await withTimeout(
            executeQuery(
              supabase
                .from("rental_listings")
                .select(`
                  id,
                  brand,
                  model,
                  year,
                  price_per_day,
                  mileage,
                  city,
                  country,
                  transmission,
                  fuel_type,
                  images,
                  owner_id,
                  profiles!rental_listings_owner_id_fkey (
                    first_name,
                    last_name,
                    user_type
                  )
                `)
                .in("id", rentalIds)
                .eq("country", selectedCountry.name)
            ),
            10000,
            'rentalDetails'
          );
          const rentalData = rentalResult.data;
          const rentalError = rentalResult.error;

          if (rentalError) {
            console.error("Error fetching rental listings details:", rentalError);
          } else {
            premiumRentalListings = (rentalData || []).map((listing: any) => ({
              ...listing,
              price: listing.price_per_day,
              listing_type: 'rental'
            }));
          }
        }

        // Combine both types of premium listings
        const allPremiumListings = [...premiumSaleListings, ...premiumRentalListings];
        console.log("[Index] All premium listings:", allPremiumListings.length);

        if (allPremiumListings.length > 0) {
          setPremiumCars(allPremiumListings);
          
          // Store premium IDs to filter them out from latest cars
          const premiumIds = allPremiumListings.map((car: any) => car.id);

          // Fetch latest cars (with timeout)
          const latestResult = await withTimeout(
            executeQuery(
              supabase
                .from("sale_listings")
                .select(`
                  *,
                  profiles!sale_listings_seller_id_fkey (
                    first_name,
                    last_name,
                    user_type
                  )
                `)
                .eq("country", selectedCountry.name)
                .order(sortBy === "price" ? "price" : "created_at", { ascending: sortBy === "price" })
                .limit(10)
            ),
            10000,
            'latestCars'
          );
          const latestData = latestResult.data;

          // Filter out premium listings from latest cars
          const filteredLatestData = (latestData || []).filter((car: any) => !premiumIds.includes(car.id)).slice(0, 6);
          console.log("[Index] Latest cars:", filteredLatestData.length);
          setFeaturedCars(filteredLatestData);
        } else {
          // If no premium listings, just fetch latest cars normally
          const latestResult = await withTimeout(
            executeQuery(
              supabase
                .from("sale_listings")
                .select(`
                  *,
                  profiles!sale_listings_seller_id_fkey (
                    first_name,
                    last_name,
                    user_type
                  )
                `)
                .eq("country", selectedCountry.name)
                .order(sortBy === "price" ? "price" : "created_at", { ascending: sortBy === "price" })
                .limit(6)
            ),
            10000,
            'latestCarsNoPremium'
          );
          const latestData = latestResult.data;

          console.log("[Index] Latest cars (no premium):", (latestData || []).length);
          setFeaturedCars(latestData || []);
        }

        // Fetch rental cars (with timeout)
        const rentalCarsResult = await withTimeout(
          executeQuery(
            supabase
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
              .eq("country", selectedCountry.name)
              .order(sortBy === "price_per_day" ? "price_per_day" : "created_at", { ascending: sortBy === "price" })
              .limit(6)
          ),
          10000,
          'rentalCars'
        );
        const rentalCarsData = rentalCarsResult.data;

        console.log("[Index] Rental cars:", (rentalCarsData || []).length);
        setRentalCars(rentalCarsData || []);

      } catch (err: any) {
        console.error('[Index] fetchCars error:', err);
        setError(err.message?.includes('TIMEOUT') 
          ? 'Le chargement a pris trop de temps. Veuillez réessayer.'
          : 'Erreur de chargement des annonces.');
      } finally {
        setLoading(false);
        console.log('[Index] fetchCars completed');
      }
    };

    fetchCars();
  }, [sortBy, selectedCountry]);

  // Loading skeleton for iOS stability
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ isolation: 'isolate' }}>
        <TopBar />
        <main className="flex-1 pt-16">
          <Hero userFirstName={userFirstName} />
          <section className="py-10 container mx-auto px-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Chargement des annonces...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </section>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ isolation: 'isolate' }}>
        <TopBar />
        <main className="flex-1 pt-16">
          <Hero userFirstName={userFirstName} />
          <section className="py-10 container mx-auto px-6">
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
          </section>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ isolation: 'isolate' }}>
      <TopBar />
      <main className="flex-1 pt-16">
        <Hero userFirstName={userFirstName} />
        {userFirstName === null && <ProPlanPromo />}
        {/* Premium Listings Section */}
        {premiumCars.length > 0 && (
          <section className="py-8 bg-background">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Annonces Premium</h2>
                <Button variant="link" asChild className="text-primary active-press text-sm">
                  <Link to="/listings">
                    Voir tout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-5 px-6 pb-4" style={{ width: 'max-content' }}>
                {premiumCars.map((car) => (
                  <div key={car.id} className="w-[280px] md:w-[320px] flex-shrink-0">
                    <PremiumCarCard
                      id={car.id}
                      brand={car.brand}
                      model={car.model}
                      year={car.year}
                      price={car.listing_type === 'rental' ? car.price_per_day || car.price : car.price}
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
        <section className="py-10 container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Véhicules en vedette</h2>
              <p className="text-sm text-muted-foreground">
                Découvrez notre sélection des meilleures offres
              </p>
            </div>
          </div>

          <Tabs defaultValue="sale" className="w-full">
            <TabsList className="h-auto p-1.5 bg-muted/50 mb-8 rounded-2xl shadow-material">
              <TabsTrigger 
                value="sale" 
                className="text-base px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-material"
              >
                Vente
              </TabsTrigger>
              <TabsTrigger 
                value="rental"
                className="text-base px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-material"
              >
                Location
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <div className="flex gap-3">
                <AdvancedFilters
                  listingType="sale"
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSortChange={setSortBy}
                  sortBy={sortBy}
                />
                <Button variant="outline" asChild className="active-press text-sm">
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
                }).map((car, index) => (
                  <div key={car.id}>
                    <CarCard
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
                    {(index + 1) % 5 === 0 && index < featuredCars.length - 1 && (
                      <AdBanner />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rental">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                }).map((car, index) => (
                  <div key={car.id}>
                    <CarCard
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
                    {(index + 1) % 5 === 0 && index < rentalCars.length - 1 && (
                      <AdBanner />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <Footer />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
