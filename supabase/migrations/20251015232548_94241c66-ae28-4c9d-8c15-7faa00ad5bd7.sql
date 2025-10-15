-- Corriger le search_path de la fonction de validation
CREATE OR REPLACE FUNCTION validate_conversation_listing_type()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si le listing_id existe dans la table correspondant au listing_type
  IF NEW.listing_type = 'sale' THEN
    IF NOT EXISTS (SELECT 1 FROM sale_listings WHERE id = NEW.listing_id) THEN
      RAISE EXCEPTION 'listing_id % does not exist in sale_listings', NEW.listing_id;
    END IF;
  ELSIF NEW.listing_type = 'rental' THEN
    IF NOT EXISTS (SELECT 1 FROM rental_listings WHERE id = NEW.listing_id) THEN
      RAISE EXCEPTION 'listing_id % does not exist in rental_listings', NEW.listing_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;