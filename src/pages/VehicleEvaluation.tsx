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
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  
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

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setEvaluation(data.evaluation);
      setVehicleImage(data.vehicleImage);
      toast.success("Évaluation terminée !");
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error?.message || "Erreur lors de l'évaluation du véhicule";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const availableModels = formData.brand ? CAR_MODELS[formData.brand] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-dark pb-20">
      <TopBar />

      <main className="container mx-auto px-4 pt-24 pb-8">
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
              <div className="mt-8 space-y-6">
                {vehicleImage && (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                    <img 
                      src={vehicleImage} 
                      alt={`${formData.brand} ${formData.model}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h4 className="text-white font-bold text-xl">
                        {formData.brand} {formData.model} {formData.year}
                      </h4>
                      <p className="text-white/90 text-sm">
                        {parseInt(formData.mileage).toLocaleString()} km • {formData.city}, {formData.country}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-2xl border-2 border-orange-400/40 p-6 shadow-lg animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-500 rounded-full p-3">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-2xl text-orange-600 dark:text-orange-400">
                      Résultat de l'évaluation
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Introduction text */}
                    <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-foreground/90 leading-relaxed">
                        Absolument ! En tant qu'expert en évaluation automobile, je vais vous fournir une estimation 
                        détaillée et professionnelle pour la <strong>{formData.brand} {formData.model} {formData.year}</strong> que 
                        vous avez décrite, en me basant sur les conditions du marché à {formData.city}, {formData.country}.
                      </p>
                    </div>

                    {/* Main evaluation title */}
                    <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                      <h4 className="font-bold text-xl text-orange-600 dark:text-orange-400">
                        Évaluation Détaillée de la {formData.brand} {formData.model} ({formData.year}) à {formData.city}, {formData.country}
                      </h4>
                    </div>

                    {/* Parse and display evaluation in structured format */}
                    <div className="bg-white/70 dark:bg-black/30 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody className="divide-y divide-orange-200 dark:divide-orange-800">
                            {evaluation.split('\n\n').map((section, sectionIndex) => {
                              const lines = section.split('\n').filter(line => line.trim());
                              
                              return lines.map((line, lineIndex) => {
                                // Headers
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return (
                                    <tr key={`${sectionIndex}-${lineIndex}`} className="bg-orange-100 dark:bg-orange-900/30">
                                      <td colSpan={2} className="px-4 py-3 font-bold text-orange-700 dark:text-orange-300">
                                        {line.replace(/\*\*/g, '')}
                                      </td>
                                    </tr>
                                  );
                                }
                                
                                // Sub-headers
                                if (line.startsWith('#')) {
                                  return (
                                    <tr key={`${sectionIndex}-${lineIndex}`} className="bg-orange-50 dark:bg-orange-950/20">
                                      <td colSpan={2} className="px-4 py-2 font-semibold text-foreground">
                                        {line.replace(/^#+\s/, '')}
                                      </td>
                                    </tr>
                                  );
                                }
                                
                                // Bullet points or list items
                                if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                                  const content = line.replace(/^[-•]\s*/, '').trim();
                                  // Try to split by colon to create key-value pairs
                                  const colonIndex = content.indexOf(':');
                                  
                                  if (colonIndex > 0) {
                                    const key = content.substring(0, colonIndex).trim();
                                    const value = content.substring(colonIndex + 1).trim();
                                    return (
                                      <tr key={`${sectionIndex}-${lineIndex}`} className="hover:bg-orange-50/50 dark:hover:bg-orange-950/10">
                                        <td className="px-4 py-3 font-medium text-foreground/80 w-1/3 align-top">
                                          {key}
                                        </td>
                                        <td className="px-4 py-3 text-foreground/90">
                                          {value}
                                        </td>
                                      </tr>
                                    );
                                  }
                                  
                                  return (
                                    <tr key={`${sectionIndex}-${lineIndex}`} className="hover:bg-orange-50/50 dark:hover:bg-orange-950/10">
                                      <td colSpan={2} className="px-4 py-2 text-foreground/90">
                                        <span className="inline-block mr-2">•</span>{content}
                                      </td>
                                    </tr>
                                  );
                                }
                                
                                // Regular paragraphs
                                if (line.trim()) {
                                  return (
                                    <tr key={`${sectionIndex}-${lineIndex}`}>
                                      <td colSpan={2} className="px-4 py-3 text-foreground/90 leading-relaxed">
                                        {line}
                                      </td>
                                    </tr>
                                  );
                                }
                                
                                return null;
                              });
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
