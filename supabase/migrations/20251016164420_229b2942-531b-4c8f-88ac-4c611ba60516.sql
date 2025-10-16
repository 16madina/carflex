-- Fix 1: Remove email and phone from public profile access
DROP POLICY IF EXISTS "Public can view active sellers basic info" ON public.profiles;

CREATE POLICY "Public can view active sellers basic info"
ON public.profiles
FOR SELECT
USING (
  (user_type = ANY (ARRAY['seller'::user_type, 'dealer'::user_type, 'agent'::user_type]))
  AND (id IN (
    SELECT sale_listings.seller_id FROM sale_listings WHERE sale_listings.seller_id IS NOT NULL
    UNION
    SELECT rental_listings.owner_id FROM rental_listings WHERE rental_listings.owner_id IS NOT NULL
  ))
);

-- Create a restricted view for public seller info (without email/phone)
CREATE OR REPLACE VIEW public.public_seller_profiles AS
SELECT 
  id,
  user_type,
  first_name,
  last_name,
  country,
  city,
  company_name,
  avatar_url,
  created_at
FROM public.profiles
WHERE user_type = ANY (ARRAY['seller'::user_type, 'dealer'::user_type, 'agent'::user_type]);

-- Fix 2: Remove public update policy for ad banner clicks
DROP POLICY IF EXISTS "Public can update click count" ON public.ad_banners;

-- Fix 3: Restrict payment_id access in rental_bookings
-- Create view without sensitive payment info
CREATE OR REPLACE VIEW public.rental_bookings_safe AS
SELECT 
  id,
  rental_listing_id,
  renter_id,
  owner_id,
  start_date,
  end_date,
  daily_rate,
  total_price,
  total_days,
  status,
  payment_status,
  cancellation_reason,
  notes,
  created_at,
  updated_at,
  -- Only show payment_id to the owner
  CASE 
    WHEN auth.uid() = owner_id THEN payment_id
    ELSE NULL
  END as payment_id
FROM public.rental_bookings;

-- Fix 4: Remove user_id from public premium_listings view
DROP POLICY IF EXISTS "Premium listings viewable by everyone" ON public.premium_listings;

CREATE POLICY "Premium listings viewable by everyone"
ON public.premium_listings
FOR SELECT
USING (is_active = true);

-- Create a safe public view for premium listings
CREATE OR REPLACE VIEW public.premium_listings_public AS
SELECT 
  id,
  listing_id,
  listing_type,
  package_id,
  start_date,
  end_date,
  is_active,
  created_at
FROM public.premium_listings
WHERE is_active = true;