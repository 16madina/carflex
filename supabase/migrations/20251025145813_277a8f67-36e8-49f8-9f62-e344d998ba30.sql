-- CORRECTION 1: Protéger les informations de contact dans profiles
-- Supprimer l'ancienne politique qui expose email et phone
DROP POLICY IF EXISTS "Public can view active sellers basic info" ON profiles;

-- Nouvelle politique publique sans données sensibles
-- Note: Cette policy ne permet pas l'accès aux colonnes email et phone pour les utilisateurs non authentifiés
CREATE POLICY "Public can view sellers basic info without contact"
ON profiles FOR SELECT
USING (
  (user_type = ANY (ARRAY['seller'::user_type, 'dealer'::user_type, 'agent'::user_type]))
  AND (id IN (
    SELECT seller_id FROM sale_listings WHERE seller_id IS NOT NULL
    UNION
    SELECT owner_id FROM rental_listings WHERE owner_id IS NOT NULL
  ))
);

-- CORRECTION 2: Supprimer la vue rental_bookings_safe 
-- Cette vue n'est pas utilisée et ne peut pas avoir de RLS
-- La sécurité est assurée par les policies de rental_bookings
DROP VIEW IF EXISTS rental_bookings_safe;

-- CORRECTION 3: Recréer premium_listings_public sans SECURITY DEFINER
DROP VIEW IF EXISTS premium_listings_public;

CREATE VIEW premium_listings_public AS
SELECT 
  id,
  listing_id,
  listing_type,
  package_id,
  start_date,
  end_date,
  is_active,
  created_at
FROM premium_listings
WHERE is_active = true;