import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Si l'URL contient un paramètre verify, rediriger vers la page de vérification
    const verifyToken = searchParams.get("verify");
    if (verifyToken) {
      navigate(`/verify-email?verify=${verifyToken}`, { replace: true });
      return;
    }
    
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname, searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-card">
      <div className="text-center space-y-6 p-8">
        <div className="text-9xl font-bold text-primary/20">404</div>
        <h1 className="text-4xl font-bold">Page introuvable</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
