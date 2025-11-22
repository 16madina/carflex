-- Create function to notify on new test drive request
CREATE OR REPLACE FUNCTION public.notify_test_drive_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name TEXT;
  vehicle_name TEXT;
  listing_table TEXT;
BEGIN
  -- Get requester's name
  SELECT CONCAT(first_name, ' ', last_name)
  INTO requester_name
  FROM profiles
  WHERE id = NEW.requester_id;

  -- Determine which table to query based on listing_type
  IF NEW.listing_type = 'sale' THEN
    listing_table := 'sale_listings';
  ELSE
    listing_table := 'rental_listings';
  END IF;

  -- Get vehicle name based on listing type
  IF NEW.listing_type = 'sale' THEN
    SELECT CONCAT(brand, ' ', model)
    INTO vehicle_name
    FROM sale_listings
    WHERE id = NEW.listing_id;
  ELSE
    SELECT CONCAT(brand, ' ', model)
    INTO vehicle_name
    FROM rental_listings
    WHERE id = NEW.listing_id;
  END IF;

  -- Create notification for the seller
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.seller_id,
    'Nouvelle demande d''essai',
    requester_name || ' souhaite essayer votre ' || vehicle_name || ' le ' || 
    TO_CHAR(NEW.preferred_date, 'DD/MM/YYYY') || ' à ' || NEW.preferred_time,
    'test_drive'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new test drive requests
DROP TRIGGER IF EXISTS trigger_notify_test_drive_request ON public.test_drive_requests;
CREATE TRIGGER trigger_notify_test_drive_request
  AFTER INSERT ON public.test_drive_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_test_drive_request();

-- Create function to notify on test drive status update
CREATE OR REPLACE FUNCTION public.notify_test_drive_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vehicle_name TEXT;
BEGIN
  -- Only notify if status changed to approved or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- Get vehicle name
    IF NEW.listing_type = 'sale' THEN
      SELECT CONCAT(brand, ' ', model)
      INTO vehicle_name
      FROM sale_listings
      WHERE id = NEW.listing_id;
    ELSE
      SELECT CONCAT(brand, ' ', model)
      INTO vehicle_name
      FROM rental_listings
      WHERE id = NEW.listing_id;
    END IF;

    -- Create notification for the requester
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.requester_id,
        'Demande d''essai approuvée !',
        'Votre demande d''essai pour ' || vehicle_name || ' a été approuvée pour le ' ||
        TO_CHAR(NEW.preferred_date, 'DD/MM/YYYY') || ' à ' || NEW.preferred_time,
        'test_drive'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.requester_id,
        'Demande d''essai refusée',
        'Votre demande d''essai pour ' || vehicle_name || ' a été refusée.',
        'test_drive'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for test drive status updates
DROP TRIGGER IF EXISTS trigger_notify_test_drive_status_change ON public.test_drive_requests;
CREATE TRIGGER trigger_notify_test_drive_status_change
  AFTER UPDATE ON public.test_drive_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_test_drive_status_change();