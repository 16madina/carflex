import { Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-cars.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProgressiveSearch from "./ProgressiveSearch";
interface SponsoredListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  type: 'sale' | 'rental';
}

interface HeroProps {
  userFirstName?: string;
}

const Hero = ({ userFirstName }: HeroProps) => {
  const [sponsoredListings, setSponsoredListings] = useState<SponsoredListing[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSponsored = async () => {
      const { data: premiumData } = await supabase
        .from('premium_listings')
        .select('listing_id, listing_type')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .limit(4);

      if (!premiumData || premiumData.length === 0) return;

      const listings: SponsoredListing[] = [];

      for (const premium of premiumData) {
        if (premium.listing_type === 'sale') {
          const { data } = await supabase
            .from('sale_listings')
            .select('id, brand, model, year, price, images')
            .eq('id', premium.listing_id)
            .maybeSingle();
          if (data) {
            listings.push({ ...data, images: (data.images as string[]) || [], type: 'sale' });
          }
        } else {
          const { data } = await supabase
            .from('rental_listings')
            .select('id, brand, model, year, price_per_day, images')
            .eq('id', premium.listing_id)
            .maybeSingle();
          if (data) {
            listings.push({ 
              id: data.id, 
              brand: data.brand, 
              model: data.model, 
              year: data.year, 
              price: data.price_per_day,
              images: (data.images as string[]) || [], 
              type: 'rental' 
            });
          }
        }
      }

      setSponsoredListings(listings);
    };

    fetchSponsored();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <section className="relative min-h-[350px] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-8">
        {/* Bouton Plan Pro en haut à droite */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <Button 
            onClick={() => navigate("/subscription")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elevated animate-fade-in hover:scale-105 transition-all duration-300 group"
            size="sm"
          >
            <Crown className="mr-2 h-4 w-4 group-hover:animate-pulse" />
            Plan Pro
          </Button>
        </div>

        <div className="max-w-2xl text-primary-foreground">
          {userFirstName && (
            <div className="flex items-center justify-between mb-4 animate-fade-in">
              <p className="text-xl font-medium">
                Bonjour 👋🏼 {userFirstName}
              </p>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight whitespace-nowrap">
            Trouvez votre voiture idéale
          </h1>
          <p className="text-lg mb-6 text-primary-foreground/90">
            Des milliers de véhicules à vendre et à louer dans toute l'Afrique
          </p>

          <ProgressiveSearch />

          {/* Annonces sponsorisées */}
          {sponsoredListings.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-primary-foreground/90">Annonces sponsorisées</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {sponsoredListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => navigate(listing.type === 'sale' ? `/listing/${listing.id}` : `/rental/${listing.id}`)}
                    className="bg-background rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow shadow-lg flex-shrink-0 w-48"
                  >
                    <div className="relative h-32">
                      <img
                        src={listing.images[0] || '/placeholder.svg'}
                        alt={`${listing.brand} ${listing.model}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-0.5">
                        <Zap className="h-3 w-3 mr-1" />
                        Sponsorisé
                      </Badge>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {listing.year} {listing.brand} {listing.model}
                      </p>
                      <p className="text-sm text-primary font-bold mt-0.5">
                        {formatPrice(listing.price)}{listing.type === 'rental' && <span className="text-[10px] font-normal text-muted-foreground">/jour</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
