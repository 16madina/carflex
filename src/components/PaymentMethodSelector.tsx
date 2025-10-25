import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Loader2, Apple } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: 'stripe' | 'apple-pay' | 'wave' | 'paypal') => Promise<void>;
  amount: number;
  formatPrice: (amount: number) => string;
}

export const PaymentMethodSelector = ({
  open,
  onOpenChange,
  onSelectMethod,
  amount,
  formatPrice
}: PaymentMethodSelectorProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleMethodClick = async (method: 'stripe' | 'apple-pay' | 'wave' | 'paypal') => {
    setLoading(method);
    try {
      await onSelectMethod(method);
    } finally {
      setLoading(null);
    }
  };

  const paymentMethods = [
    {
      id: 'stripe' as const,
      name: 'Carte bancaire',
      description: 'Visa, Mastercard (incluant Wave Visa)',
      icon: CreditCard,
      available: true,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'apple-pay' as const,
      name: 'Apple Pay',
      description: 'Paiement rapide avec Apple Pay',
      icon: Apple,
      available: true,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    },
    {
      id: 'wave' as const,
      name: 'Wave',
      description: 'Paiement mobile Money (Orange, MTN, Moov)',
      icon: Smartphone,
      available: false,
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'paypal' as const,
      name: 'PayPal',
      description: 'Paiement via compte PayPal',
      icon: CreditCard,
      available: false,
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir un moyen de paiement</DialogTitle>
          <DialogDescription>
            Montant à payer : <span className="font-bold text-foreground">{formatPrice(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isLoading = loading === method.id;

            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all ${method.color} ${
                  !method.available ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => method.available && !isLoading && handleMethodClick(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{method.name}</h3>
                        {!method.available && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                            Bientôt disponible
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full mt-2"
        >
          Annuler
        </Button>
      </DialogContent>
    </Dialog>
  );
};
