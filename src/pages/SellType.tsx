import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Key, ArrowLeft } from "lucide-react";
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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
              onClick={() => navigate("/sell/vendre")}
            >
              <CardContent className="flex flex-col items-center justify-center p-10 space-y-6">
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-14 h-14 text-primary" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-center text-foreground leading-tight">
                  Je veux vendre<br />mon véhicule
                </h2>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border-0 shadow-lg overflow-hidden"
              onClick={() => navigate("/sell/louer")}
            >
              <CardContent className="flex flex-col items-center justify-center p-10 space-y-6">
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key className="w-14 h-14 text-primary" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-center text-foreground leading-tight">
                  Je veux louer<br />mon véhicule
                </h2>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-white text-lg font-medium px-4">
            La publication est rapide et gratuite. Commencez dès maintenant !
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SellType;
