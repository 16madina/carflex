-- Price history table
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale','rental')),
  old_price NUMERIC,
  new_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_history_listing ON public.price_history(listing_id, listing_type, created_at DESC);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history is publicly readable"
ON public.price_history FOR SELECT
USING (true);

-- Trigger function for sale_listings
CREATE OR REPLACE FUNCTION public.track_sale_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO price_history (listing_id, listing_type, old_price, new_price)
    VALUES (NEW.id, 'sale', NULL, NEW.price);
  ELSIF TG_OP = 'UPDATE' AND OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO price_history (listing_id, listing_type, old_price, new_price)
    VALUES (NEW.id, 'sale', OLD.price, NEW.price);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sale_price_history
AFTER INSERT OR UPDATE OF price ON public.sale_listings
FOR EACH ROW EXECUTE FUNCTION public.track_sale_price_change();

-- Trigger function for rental_listings
CREATE OR REPLACE FUNCTION public.track_rental_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO price_history (listing_id, listing_type, old_price, new_price)
    VALUES (NEW.id, 'rental', NULL, NEW.price_per_day);
  ELSIF TG_OP = 'UPDATE' AND OLD.price_per_day IS DISTINCT FROM NEW.price_per_day THEN
    INSERT INTO price_history (listing_id, listing_type, old_price, new_price)
    VALUES (NEW.id, 'rental', OLD.price_per_day, NEW.price_per_day);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rental_price_history
AFTER INSERT OR UPDATE OF price_per_day ON public.rental_listings
FOR EACH ROW EXECUTE FUNCTION public.track_rental_price_change();