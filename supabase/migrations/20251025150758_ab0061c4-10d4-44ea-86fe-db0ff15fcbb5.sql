-- Corriger les vues avec SECURITY DEFINER
-- Ces vues doivent utiliser SECURITY INVOKER pour respecter les RLS de l'utilisateur

-- Supprimer et recréer public_seller_profiles avec SECURITY INVOKER
DROP VIEW IF EXISTS public.public_seller_profiles;

CREATE VIEW public.public_seller_profiles 
WITH (security_invoker = true)
AS
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

-- Supprimer et recréer premium_listings_public avec SECURITY INVOKER
DROP VIEW IF EXISTS public.premium_listings_public;

CREATE VIEW public.premium_listings_public
WITH (security_invoker = true)
AS
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

COMMENT ON VIEW public.public_seller_profiles IS 'Vue publique des profils vendeurs avec SECURITY INVOKER pour respecter les RLS';
COMMENT ON VIEW public.premium_listings_public IS 'Vue publique des listings premium actifs avec SECURITY INVOKER pour respecter les RLS';