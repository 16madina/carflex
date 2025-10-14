import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { CAR_BRANDS, CAR_MODELS } from "@/constants/vehicles";

const VehicleEvaluation = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    country: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEvaluation(null);

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-vehicle', {
        body: formData
      });

      if (error) throw error;

      setEvaluation(data.evaluation);
      toast.success("Évaluation terminée !");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erreur lors de l'évaluation du véhicule");
    } finally {
      setIsLoading(false);
    }
  };

  const availableModels = formData.brand ? CAR_MODELS[formData.brand] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-dark pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Évaluation intelligente</h1>
            <p className="text-white/70">Obtenez une estimation précise basée sur le marché local</p>
          </div>

          <Card className="shadow-2xl border-accent/20">
            <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => setFormData({ ...formData, brand: value, model: "" })}
                    required
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CAR_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modèle *</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => setFormData({ ...formData, model: value })}
                    required
                    disabled={!formData.brand}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={formData.brand ? "Sélectionner un modèle" : "Choisissez d'abord une marque"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Année *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilométrage *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">État *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neuf</SelectItem>
                    <SelectItem value="used">Occasion</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Bon</SelectItem>
                    <SelectItem value="fair">Correct</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-lg shadow-lg transition-all hover:shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Obtenir l'évaluation AI
                  </>
                )}
              </Button>
            </form>

            {evaluation && (
              <div className="mt-8 p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border-2 border-accent/30 shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-accent" />
                  <h3 className="font-bold text-xl text-accent">Résultat de l'évaluation</h3>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {evaluation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default VehicleEvaluation;
