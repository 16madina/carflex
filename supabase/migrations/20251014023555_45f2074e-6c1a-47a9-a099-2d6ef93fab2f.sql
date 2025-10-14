-- Add foreign key constraint to link premium_listings to sale_listings
ALTER TABLE public.premium_listings
DROP CONSTRAINT IF EXISTS premium_listings_sale_listing_fk;

ALTER TABLE public.premium_listings
ADD CONSTRAINT premium_listings_sale_listing_fk
FOREIGN KEY (listing_id)
REFERENCES public.sale_listings(id)
ON DELETE CASCADE;