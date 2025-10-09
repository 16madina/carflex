import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Mock featured cars
  const featuredCars = [
    {
      id: "1",
      brand: "BMW",
      model: "Série 3",
      year: 2022,
      price: 42900,
      mileage: 15000,
      city: "Paris",
      transmission: "Automatique",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
    },
    {
      id: "2",
      brand: "Mercedes",
      model: "Classe A",
      year: 2023,
      price: 38500,
      mileage: 8000,
      city: "Lyon",
      transmission: "Automatique",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
    },
    {
      id: "3",
      brand: "Audi",
      model: "A4",
      year: 2021,
      price: 35000,
      mileage: 25000,
      city: "Marseille",
      transmission: "Automatique",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Featured Cars Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Véhicules en vedette</h2>
            <p className="text-muted-foreground">
              Découvrez notre sélection des meilleures offres
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/listings">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCars.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">Prêt à vendre votre voiture ?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Créez une annonce gratuitement en quelques minutes
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/sell">
              Créer une annonce
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CarFlex</h3>
              <p className="text-sm text-muted-foreground">
                La plateforme de référence pour acheter, vendre et louer des véhicules.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Acheter</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/listings" className="hover:text-primary">Toutes les annonces</Link></li>
                <li><Link to="/listings" className="hover:text-primary">Voitures neuves</Link></li>
                <li><Link to="/listings" className="hover:text-primary">Voitures d'occasion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Vendre</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sell" className="hover:text-primary">Créer une annonce</Link></li>
                <li><Link to="/sell" className="hover:text-primary">Estimateur de prix</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">À propos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Aide</a></li>
                <li><a href="#" className="hover:text-primary">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 CarFlex. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
