import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Rafraîchir l'état de l'abonnement
    refreshSubscription();
    
    toast({
      title: "Abonnement activé !",
      description: "Votre plan Pro est maintenant actif. Profitez de tous les avantages premium !",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Bienvenue dans Pro !</h1>
        <p className="text-muted-foreground mb-8">
          Votre abonnement premium a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités avancées.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Aller au tableau de bord
          </Button>
          <Button onClick={() => navigate("/sell/vendre")} variant="outline" className="w-full">
            Créer une annonce
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
