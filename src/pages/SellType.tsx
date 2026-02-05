import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Key, Calculator, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAppSettings } from "@/hooks/useAppSettings";

const SellType = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { subscribed, loading: subLoading } = useSubscription();
  const { settings, loading: settingsLoading } = useAppSettings();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour poster une annonce");
        navigate("/auth");
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  const handleEvaluationClick = () => {
    const isRestricted = settings.restrict_vehicle_evaluation_to_pro;
    
    if (isRestricted && !subscribed) {
      toast.error("Cette fonctionnalité est réservée aux utilisateurs Pro", {
        description: "Passez au plan Pro pour accéder à l'évaluation de véhicule",
        action: {
          label: "Voir les plans",
          onClick: () => navigate("/subscription")
        }
      });
      return;
    }
    
    navigate("/sell/evaluer");
  };

  const isEvaluationRestricted = settings.restrict_vehicle_evaluation_to_pro && !subscribed;
  const isLoading = subLoading || settingsLoading;

  return (
    <div className="min-h-screen bg-primary pb-20">
      <TopBar />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
              onClick={() => navigate("/sell/vendre")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="relative w-20 h-20">
                  {/* Liquid gradient background */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20 blur-xl animate-pulse" />
                  {/* Glassmorphism container */}
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                      <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-center text-foreground leading-tight">
                  Je veux vendre<br />mon véhicule
                </h2>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
              onClick={() => navigate("/sell/louer")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="relative w-20 h-20">
                  {/* Liquid gradient background */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                  {/* Glassmorphism container */}
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                      <Key className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-center text-foreground leading-tight">
                  Je veux louer<br />mon véhicule
                </h2>
              </CardContent>
            </Card>
          </div>

          <Card 
            className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
            onClick={handleEvaluationClick}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="relative w-24 h-24">
                {/* Liquid gradient background */}
                <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                  isEvaluationRestricted 
                    ? 'bg-gradient-to-br from-muted/30 via-muted/10 to-muted/20' 
                    : 'bg-gradient-to-br from-accent/30 via-accent/10 to-primary/20'
                }`} style={{ animationDelay: '1s' }} />
                {/* Glassmorphism container */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-center">
                  {isEvaluationRestricted ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted-foreground/60 to-muted-foreground/40 flex items-center justify-center shadow-md">
                      <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
                      <Calculator className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h2 className={`text-xl font-bold text-center leading-tight ${
                  isEvaluationRestricted ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  Évaluer mon véhicule
                  {isEvaluationRestricted && (
                    <span className="ml-2 text-xs text-primary font-normal">
                      (Pro uniquement)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  {isEvaluationRestricted 
                    ? "Passez au plan Pro pour accéder à cette fonctionnalité"
                    : "Obtenez une estimation de prix basée sur le marché"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-white text-base font-medium px-4">
            La publication est rapide et gratuite. Commencez dès maintenant !
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SellType;
