import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get("listing_id");
  const sessionId = searchParams.get("session_id");
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setProcessing(false);
        toast({
          title: "Paiement réussi !",
          description: "Votre annonce a été promue avec succès.",
        });
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("Non authentifié");
        }

        // Appeler la fonction de vérification
        const { data, error } = await supabase.functions.invoke("verify-stripe-payment", {
          body: { session_id: sessionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error("Erreur vérification:", error);
          throw error;
        }

        console.log("Vérification réussie:", data);
        
        setProcessing(false);
        
        toast({
          title: "Paiement réussi !",
          description: data.already_active 
            ? "Votre annonce est déjà promue." 
            : `Votre annonce est promue pour ${data.duration_days} jours.`,
        });
      } catch (error) {
        console.error("Erreur:", error);
        setProcessing(false);
        toast({
          title: "Attention",
          description: "Le paiement a été effectué mais l'activation du premium peut prendre quelques instants.",
          variant: "default",
        });
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (processing) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-center text-muted-foreground">
                  Traitement de votre paiement en cours...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Paiement réussi !</CardTitle>
            <CardDescription className="text-center">
              Votre promotion a été activée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Votre annonce bénéficie maintenant d'une visibilité accrue et apparaîtra en tête des résultats de recherche.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate("/dashboard")} className="w-full" size="lg">
                Voir mon tableau de bord
              </Button>
              <Button onClick={() => navigate("/profile")} variant="outline" className="w-full">
                Voir mes annonces
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default PaymentSuccess;
