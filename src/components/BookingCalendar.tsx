import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isSameDay, isWithinInterval } from "date-fns";

interface BookingCalendarProps {
  listingId: string;
  onDateSelect: (startDate: Date | null, endDate: Date | null) => void;
}

interface Booking {
  start_date: string;
  end_date: string;
  status: string;
}

const BookingCalendar = ({ listingId, onDateSelect }: BookingCalendarProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('booking-calendar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_bookings',
          filter: `rental_listing_id=eq.${listingId}`
        },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("rental_bookings")
      .select("start_date, end_date, status")
      .eq("rental_listing_id", listingId)
      .in("status", ["pending", "confirmed"]);

    if (data) {
      setBookings(data);
    }
  };

  const isDateBooked = (date: Date): boolean => {
    return bookings.some((booking) => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      return isWithinInterval(date, { start, end });
    });
  };

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) {
      setSelectedDates({ from: undefined, to: undefined });
      onDateSelect(null, null);
      return;
    }

    // Vérifier si les dates sélectionnées chevauchent des réservations
    if (range.from && range.to) {
      let hasConflict = false;
      let currentDate = range.from;
      
      while (currentDate <= range.to) {
        if (isDateBooked(currentDate)) {
          hasConflict = true;
          break;
        }
        currentDate = addDays(currentDate, 1);
      }

      if (!hasConflict) {
        setSelectedDates(range);
        onDateSelect(range.from, range.to);
      }
    } else if (range.from) {
      setSelectedDates(range);
      onDateSelect(range.from, null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sélectionnez vos dates</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Calendar
          mode="range"
          selected={selectedDates}
          onSelect={handleSelect}
          disabled={(date) => 
            date < new Date() || isDateBooked(date)
          }
          className="rounded-md border"
        />
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="w-4 h-4 p-0"></Badge>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="w-4 h-4 p-0 opacity-50"></Badge>
            <span className="text-sm">Réservé</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
