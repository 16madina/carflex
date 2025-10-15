import { Link } from "react-router-dom";

const Footer = () => {
  return (
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
            <h4 className="font-semibold mb-4">Informations légales</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy-policy" className="hover:text-primary">Politique de confidentialité</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary">Conditions d'utilisation</Link></li>
              <li><Link to="/data-protection" className="hover:text-primary">Protection des données</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">
              Conditions d'utilisation
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link to="/data-protection" className="hover:text-primary transition-colors">
              Protection des données
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © 2025 CarFlex. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
