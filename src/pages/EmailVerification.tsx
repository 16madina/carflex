import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("verify");
    
    if (!token) {
      setError("Token de vérification manquant");
      setVerifying(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { token }
      });

      if (error) throw error;

      if (data.success) {
        setSuccess(true);
        toast.success("Votre email a été vérifié avec succès !");
      } else {
        throw new Error(data.error || "Erreur lors de la vérification");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Token invalide ou expiré");
      toast.error(err.message || "Erreur lors de la vérification");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Vérification de l'email</CardTitle>
          <CardDescription>
            {verifying ? "Vérification en cours..." : success ? "Email vérifié !" : "Échec de la vérification"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verifying && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Veuillez patienter...</p>
            </div>
          )}

          {!verifying && success && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg">Votre email a été vérifié avec succès !</p>
              <p className="text-muted-foreground">
                Vous pouvez maintenant profiter de toutes les fonctionnalités avec votre badge vérifié ✓
              </p>
              <Button onClick={() => navigate("/profile")} className="w-full">
                Voir mon profil
              </Button>
            </div>
          )}

          {!verifying && !success && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-muted-foreground">
                Le lien de vérification est peut-être expiré ou invalide.
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
