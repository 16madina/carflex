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

      <main className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-white"
              onClick={() => navigate("/sell/vendre")}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-center">
                  Je veux vendre<br />mon véhicule
                </h2>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-white"
              onClick={() => navigate("/sell/louer")}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-center">
                  Je veux louer<br />mon véhicule
                </h2>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-white text-lg">
            La publication est rapide et gratuite. Commencez dès maintenant !
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SellType;
