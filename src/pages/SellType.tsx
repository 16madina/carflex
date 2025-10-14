import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Key, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

const SellType = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-primary pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
              onClick={() => navigate("/sell/vendre")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-primary" strokeWidth={2.5} />
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
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key className="w-8 h-8 text-primary" strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-bold text-center text-foreground leading-tight">
                  Je veux louer<br />mon véhicule
                </h2>
              </CardContent>
            </Card>
          </div>

          <Card 
            className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
            onClick={() => navigate("/sell/evaluer")}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                <Calculator className="w-10 h-10 text-accent" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-center text-foreground leading-tight">
                Évaluer mon véhicule
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                Obtenez une estimation de prix basée sur le marché
              </p>
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
