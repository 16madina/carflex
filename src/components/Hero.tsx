import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-cars.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[500px] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="max-w-2xl text-primary-foreground">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Trouvez votre voiture idéale
          </h1>
          <p className="text-lg mb-6 text-primary-foreground/90">
            Des milliers de véhicules à vendre et à louer dans toute la France
          </p>

          <div className="bg-background rounded-xl p-5 shadow-elevated">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Marque, modèle, année..."
                  className="h-11 text-base"
                />
              </div>
              <Button size="lg" className="h-11 px-6">
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
