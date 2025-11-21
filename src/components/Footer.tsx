import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div>
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
