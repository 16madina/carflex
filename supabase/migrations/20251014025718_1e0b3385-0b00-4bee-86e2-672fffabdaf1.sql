-- Add body_type column to rental_listings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rental_listings' 
    AND column_name = 'body_type'
  ) THEN
    ALTER TABLE public.rental_listings ADD COLUMN body_type TEXT;
  END IF;
END $$;

-- Add body_type index for better query performance
CREATE INDEX IF NOT EXISTS idx_rental_listings_body_type ON public.rental_listings(body_type);
CREATE INDEX IF NOT EXISTS idx_sale_listings_body_type ON public.sale_listings(body_type);