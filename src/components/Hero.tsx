import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-cars.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  userFirstName?: string;
}

const Hero = ({ userFirstName }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

          <div className="bg-background rounded-xl p-4 shadow-elevated">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Marque, modèle, année..."
                  className="h-11 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button size="lg" className="h-11 px-6" onClick={handleSearch}>
                <Search className="mr-2 h-5 w-5" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
