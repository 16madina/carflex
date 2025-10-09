import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, User, Heart } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Car className="h-6 w-6 text-primary" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              CarFlex
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/listings" className="text-sm font-medium hover:text-primary transition-colors">
              Acheter
            </Link>
            <Link to="/rental" className="text-sm font-medium hover:text-primary transition-colors">
              Louer
            </Link>
            <Link to="/sell" className="text-sm font-medium hover:text-primary transition-colors">
              Vendre
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/favorites">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Connexion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
