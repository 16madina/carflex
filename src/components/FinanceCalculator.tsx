import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCountry } from "@/contexts/CountryContext";

interface FinanceCalculatorProps {
  dailyPrice: number;
}

const FinanceCalculator = ({ dailyPrice }: FinanceCalculatorProps) => {
  const [rentalDays, setRentalDays] = useState(7);
  const { formatPrice } = useCountry();

  const totalCost = dailyPrice * rentalDays;
  const averageDailyCost = totalCost / rentalDays;
  
  // Estimation avec assurance et frais (environ 15% du total)
  const withInsurance = totalCost * 1.15;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl">Calculateur de location</CardTitle>
        <CardDescription>
          Estimez le coût total de votre location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rental Days Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Durée de location</Label>
            <span className="text-lg font-bold text-primary">
              {rentalDays} {rentalDays === 1 ? 'jour' : 'jours'}
            </span>
          </div>
          <Slider
            value={[rentalDays]}
            onValueChange={(value) => setRentalDays(value[0])}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 jour</span>
            <span>30 jours</span>
          </div>
        </div>

        {/* Manual Input */}
        <div className="space-y-2">
          <Label htmlFor="days-input">Ou entrez le nombre de jours</Label>
          <Input
            id="days-input"
            type="number"
            min={1}
            max={365}
            value={rentalDays}
            onChange={(e) => setRentalDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
            placeholder="Nombre de jours"
          />
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Prix par jour</span>
            <span className="font-semibold">{formatPrice(dailyPrice)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sous-total ({rentalDays} jours)</span>
            <span className="font-semibold">{formatPrice(totalCost)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Assurance et frais estimés</span>
            <span className="text-muted-foreground">{formatPrice(withInsurance - totalCost)}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-bold">Total estimé</span>
            <span className="text-2xl font-bold text-accent">
              {formatPrice(withInsurance)}
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-1">💡 Remarque</p>
          <p>
            Le prix final peut varier selon l'assurance choisie, le kilométrage et les options supplémentaires.
            Contactez le propriétaire pour obtenir un devis exact.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceCalculator;
