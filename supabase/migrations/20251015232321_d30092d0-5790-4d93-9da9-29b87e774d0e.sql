-- Corriger les conversations existantes avec le mauvais listing_type
UPDATE conversations
SET listing_type = 'rental'
WHERE listing_id IN (SELECT id FROM rental_listings)
AND listing_type = 'sale';

UPDATE conversations
SET listing_type = 'sale'
WHERE listing_id IN (SELECT id FROM sale_listings)
AND listing_type = 'rental';

-- Créer une fonction de validation pour le listing_type
CREATE OR REPLACE FUNCTION validate_conversation_listing_type()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Créer un trigger pour valider le listing_type lors de l'insertion ou mise à jour
CREATE TRIGGER validate_conversation_listing_type_trigger
BEFORE INSERT OR UPDATE ON conversations
FOR EACH ROW
WHEN (NEW.listing_id IS NOT NULL)
EXECUTE FUNCTION validate_conversation_listing_type();