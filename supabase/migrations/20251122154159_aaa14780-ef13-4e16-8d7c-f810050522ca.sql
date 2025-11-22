-- Update the notify_test_drive_request function to also send push notifications
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

  -- Create notification for the seller (in-app)
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.seller_id,
    'Nouvelle demande d''essai',
    requester_name || ' souhaite essayer votre ' || vehicle_name || ' le ' || 
    TO_CHAR(NEW.preferred_date, 'DD/MM/YYYY') || ' à ' || NEW.preferred_time,
    'test_drive'
  );

  -- Send push notification asynchronously
  PERFORM net.http_post(
    url := 'https://dgmqdovojzzbdovgkawu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbXFkb3Zvanp6YmRvdmdrYXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk2NzQxMiwiZXhwIjoyMDc1NTQzNDEyfQ.AuzqyVhSMkGGPl6Ps-VG7JGzfFW6OOxlJfTUw9i3NwA'
    ),
    body := jsonb_build_object(
      'user_id', NEW.seller_id,
      'title', 'Nouvelle demande d''essai',
      'body', requester_name || ' souhaite essayer votre ' || vehicle_name,
      'data', jsonb_build_object(
        'type', 'test_drive',
        'request_id', NEW.id,
        'listing_id', NEW.listing_id
      )
    )
  );

  RETURN NEW;
END;
$$;

-- Update the notify_test_drive_status_change function to also send push notifications
CREATE OR REPLACE FUNCTION public.notify_test_drive_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vehicle_name TEXT;
  notification_title TEXT;
  notification_body TEXT;
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

    -- Prepare notification content
    IF NEW.status = 'approved' THEN
      notification_title := 'Demande d''essai approuvée !';
      notification_body := 'Votre demande d''essai pour ' || vehicle_name || ' a été approuvée pour le ' ||
        TO_CHAR(NEW.preferred_date, 'DD/MM/YYYY') || ' à ' || NEW.preferred_time;
    ELSIF NEW.status = 'rejected' THEN
      notification_title := 'Demande d''essai refusée';
      notification_body := 'Votre demande d''essai pour ' || vehicle_name || ' a été refusée.';
    END IF;

    -- Create in-app notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.requester_id,
      notification_title,
      notification_body,
      'test_drive'
    );

    -- Send push notification
    PERFORM net.http_post(
      url := 'https://dgmqdovojzzbdovgkawu.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbXFkb3Zvanp6YmRvdmdrYXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk2NzQxMiwiZXhwIjoyMDc1NTQzNDEyfQ.AuzqyVhSMkGGPl6Ps-VG7JGzfFW6OOxlJfTUw9i3NwA'
      ),
      body := jsonb_build_object(
        'user_id', NEW.requester_id,
        'title', notification_title,
        'body', notification_body,
        'data', jsonb_build_object(
          'type', 'test_drive',
          'request_id', NEW.id,
          'listing_id', NEW.listing_id,
          'status', NEW.status
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$;