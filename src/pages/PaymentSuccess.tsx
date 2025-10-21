import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get("listing_id");

  useEffect(() => {
    toast({
      title: "Paiement réussi !",
      description: "Votre annonce a été promue avec succès.",
    });
  }, []);

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
              <Button onClick={() => navigate("/listings")} variant="outline" className="w-full">
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
