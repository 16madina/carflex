import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface BudgetCalculatorProps {
  onBudgetChange: (maxPrice: number) => void;
}

const BudgetCalculator = ({ onBudgetChange }: BudgetCalculatorProps) => {
  const [downPayment, setDownPayment] = useState(5000000); // 5M XOF
  const [monthlyPayment, setMonthlyPayment] = useState(500000); // 500K XOF
  const [loanDuration, setLoanDuration] = useState([36]); // 36 months
  const [interestRate] = useState(8); // 8% annual interest

  const calculateMaxPrice = () => {
    const months = loanDuration[0];
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate present value of annuity
    const loanAmount = monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
    
    return Math.round(downPayment + loanAmount);
  };

  useEffect(() => {
    const maxPrice = calculateMaxPrice();
    onBudgetChange(maxPrice);
  }, [downPayment, monthlyPayment, loanDuration]);

  const maxPrice = calculateMaxPrice();

  return (
    <Card className="p-4 space-y-4 bg-secondary/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calculator className="h-4 w-4 text-primary" />
        <span>Calculateur de budget</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs">Apport initial (XOF)</Label>
          <Input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Paiement mensuel (XOF)</Label>
          <Input
            type="number"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Durée du prêt: {loanDuration[0]} mois</Label>
          <Slider
            value={loanDuration}
            onValueChange={setLoanDuration}
            min={12}
            max={84}
            step={6}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 an</span>
            <span>7 ans</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground mb-1">Budget maximum</div>
        <div className="text-lg font-bold text-primary">
          {maxPrice.toLocaleString()} XOF
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Taux d'intérêt: {interestRate}% annuel
        </div>
      </div>
    </Card>
  );
};

export default BudgetCalculator;
