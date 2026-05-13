import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCountry } from "@/contexts/CountryContext";

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => Promise<void>;
  basePrice?: number;
  title?: string;
}

const OfferDialog = ({ open, onOpenChange, onSubmit, basePrice, title = "Faire une offre" }: OfferDialogProps) => {
  const { formatPrice } = useCountry();
  const [amount, setAmount] = useState<string>(basePrice ? String(Math.round(basePrice * 0.9)) : "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit(n);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {basePrice ? (
            <p className="text-sm text-muted-foreground">
              Prix demandé : <span className="font-semibold text-foreground">{formatPrice(basePrice)}</span>
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="offer-amount">Votre offre</Label>
            <Input
              id="offer-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant"
              className="text-foreground"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !Number(amount)}>
            Envoyer l'offre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferDialog;
