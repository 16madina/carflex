-- Create rental_bookings table
CREATE TABLE public.rental_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_listing_id UUID NOT NULL REFERENCES public.rental_listings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  daily_rate DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create index for faster queries
CREATE INDEX idx_rental_bookings_listing ON public.rental_bookings(rental_listing_id);
CREATE INDEX idx_rental_bookings_renter ON public.rental_bookings(renter_id);
CREATE INDEX idx_rental_bookings_owner ON public.rental_bookings(owner_id);
CREATE INDEX idx_rental_bookings_dates ON public.rental_bookings(start_date, end_date);

-- Enable RLS
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Renters can view their own bookings"
ON public.rental_bookings
FOR SELECT
USING (auth.uid() = renter_id);

CREATE POLICY "Owners can view bookings for their listings"
ON public.rental_bookings
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create bookings"
ON public.rental_bookings
FOR INSERT
WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Owners can update bookings for their listings"
ON public.rental_bookings
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Renters can update their own bookings"
ON public.rental_bookings
FOR UPDATE
USING (auth.uid() = renter_id AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_rental_bookings_updated_at
BEFORE UPDATE ON public.rental_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to notify on booking status change
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_name TEXT;
  renter_name TEXT;
  listing_info TEXT;
BEGIN
  -- Get owner and renter names
  SELECT CONCAT(first_name, ' ', last_name) INTO owner_name
  FROM profiles WHERE id = NEW.owner_id;
  
  SELECT CONCAT(first_name, ' ', last_name) INTO renter_name
  FROM profiles WHERE id = NEW.renter_id;
  
  -- Get listing info
  SELECT CONCAT(brand, ' ', model) INTO listing_info
  FROM rental_listings WHERE id = NEW.rental_listing_id;

  -- Notify renter of status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'confirmed' THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.renter_id,
        'Réservation confirmée',
        'Votre réservation pour ' || listing_info || ' a été confirmée !',
        'booking'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.renter_id,
        'Réservation refusée',
        'Votre réservation pour ' || listing_info || ' a été refusée.',
        'booking'
      );
    END IF;
  END IF;

  -- Notify owner of new booking
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.owner_id,
      'Nouvelle demande de réservation',
      renter_name || ' souhaite louer votre ' || listing_info,
      'booking'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for booking notifications
CREATE TRIGGER on_booking_status_change
AFTER INSERT OR UPDATE ON public.rental_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_status_change();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_bookings;