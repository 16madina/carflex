import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProPlanPromo = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenPromo = sessionStorage.getItem("hasSeenProPlanPromo");
    if (hasSeenPromo) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenProPlanPromo", "true");
  };

  const handleNavigate = () => {
    navigate("/subscription");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-fade-in">
      <div className="relative bg-gradient-to-br from-accent via-accent to-accent/80 text-accent-foreground rounded-2xl shadow-elevated p-6 max-w-sm animate-scale-in">
        {/* Crown icon with pulse animation */}
        <div className="absolute -top-4 -left-4 bg-primary rounded-full p-3 shadow-elevated animate-pulse">
          <Crown className="w-6 h-6 text-primary-foreground" />
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-accent-foreground/70 hover:text-accent-foreground transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="mt-2">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            Devenez Pro !
          </h3>
          <p className="text-accent-foreground/90 mb-4 text-sm">
            Débloquez des fonctionnalités exclusives et boostez vos annonces
          </p>
          
          <Button
            onClick={handleNavigate}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group"
            size="lg"
          >
            Découvrir le Plan Pro
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -z-10 bottom-0 left-0 w-24 h-24 bg-accent-foreground/10 rounded-full blur-xl" />
      </div>
    </div>
  );
};

export default ProPlanPromo;
