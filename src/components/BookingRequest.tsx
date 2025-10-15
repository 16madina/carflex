import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import { differenceInDays } from "date-fns";
import { Calendar, CreditCard } from "lucide-react";
import BookingCalendar from "./BookingCalendar";

interface BookingRequestProps {
  listing: any;
}

const BookingRequest = ({ listing }: BookingRequestProps) => {
  const { toast } = useToast();
  const { formatPrice } = useCountry();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(endDate, startDate) + 1;
    return days * parseFloat(listing.price_per_day);
  };

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalPrice = calculateTotal();

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Dates manquantes",
        description: "Veuillez sélectionner les dates de début et de fin.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour réserver.",
        });
        return;
      }

      const { error } = await supabase.from("rental_bookings").insert({
        rental_listing_id: listing.id,
        renter_id: user.id,
        owner_id: listing.owner_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_days: totalDays,
        daily_rate: listing.price_per_day,
        total_price: totalPrice,
        notes,
      });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Le propriétaire a été notifié. Vous recevrez une réponse bientôt.",
      });

      // Réinitialiser le formulaire
      setStartDate(null);
      setEndDate(null);
      setNotes("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <BookingCalendar listingId={listing.id} onDateSelect={handleDateSelect} />

      {startDate && endDate && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé de la réservation</CardTitle>
            <CardDescription>Vérifiez les détails avant de confirmer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Durée</span>
              </div>
              <span className="font-medium">{totalDays} jour{totalDays > 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Prix par jour</span>
              </div>
              <span className="font-medium">{formatPrice(parseFloat(listing.price_per_day))}</span>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des détails ou des questions pour le propriétaire..."
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Envoi..." : "Envoyer la demande de réservation"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Le propriétaire doit confirmer votre réservation avant le paiement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingRequest;
