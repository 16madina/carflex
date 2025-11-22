-- Update notify_test_drive_request to check preferences
CREATE OR REPLACE FUNCTION public.notify_test_drive_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name TEXT;
  vehicle_name TEXT;
  listing_table TEXT;
BEGIN
  -- Check if user wants test_drive notifications
  IF NOT should_notify(NEW.seller_id, 'test_drive') THEN
    RETURN NEW;
  END IF;

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

-- Update notify_new_message to check preferences
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  conversation_listing_id UUID;
BEGIN
  -- Get the recipient (the person who is NOT the sender)
  SELECT 
    CASE 
      WHEN c.participant1_id = NEW.sender_id THEN c.participant2_id
      ELSE c.participant1_id
    END,
    c.listing_id
  INTO recipient_id, conversation_listing_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Check if user wants message notifications
  IF NOT should_notify(recipient_id, 'message') THEN
    RETURN NEW;
  END IF;

  -- Get sender's name
  SELECT CONCAT(first_name, ' ', last_name)
  INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification for the recipient
  INSERT INTO notifications (user_id, title, message, read, type)
  VALUES (
    recipient_id,
    'Nouveau message',
    sender_name || ' vous a envoyé un message',
    false,
    'message'
  );

  RETURN NEW;
END;
$$;

-- Update notify_booking_status_change to check preferences
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_name TEXT;
  renter_name TEXT;
  listing_info TEXT;
BEGIN
  -- Get owner and renter names
  SELECT CONCAT(first_name, ' ', last_name) INTO owner_name
  FROM profiles WHERE id = NEW.owner_id;
  
  SELECT CONCAT(first_name, ' ', last_name) INTO renter_name
  FROM profiles WHERE id = NEW.renter_id;
  
  -- Get listing info
  SELECT CONCAT(brand, ' ', model) INTO listing_info
  FROM rental_listings WHERE id = NEW.rental_listing_id;

  -- Notify renter of status change (if they want booking notifications)
  IF OLD.status IS DISTINCT FROM NEW.status AND should_notify(NEW.renter_id, 'booking') THEN
    IF NEW.status = 'confirmed' THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.renter_id,
        'Réservation confirmée',
        'Votre réservation pour ' || listing_info || ' a été confirmée !',
        'booking'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.renter_id,
        'Réservation refusée',
        'Votre réservation pour ' || listing_info || ' a été refusée.',
        'booking'
      );
    END IF;
  END IF;

  -- Notify owner of new booking (if they want booking notifications)
  IF TG_OP = 'INSERT' AND should_notify(NEW.owner_id, 'booking') THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.owner_id,
      'Nouvelle demande de réservation',
      renter_name || ' souhaite louer votre ' || listing_info,
      'booking'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Update notify_test_drive_status_change to check preferences
CREATE OR REPLACE FUNCTION public.notify_test_drive_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vehicle_name TEXT;
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  -- Only notify if status changed to approved or rejected and user wants test_drive notifications
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') AND should_notify(NEW.requester_id, 'test_drive') THEN
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