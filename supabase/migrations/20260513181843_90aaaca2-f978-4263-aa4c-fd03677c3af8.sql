
CREATE OR REPLACE FUNCTION public.notify_offer_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  offer_sender_id UUID;
  responder_name TEXT;
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  -- Only fire when offer_status changes from pending to accepted/rejected
  IF NEW.message_type <> 'offer' THEN
    RETURN NEW;
  END IF;
  IF OLD.offer_status IS NOT DISTINCT FROM NEW.offer_status THEN
    RETURN NEW;
  END IF;
  IF NEW.offer_status NOT IN ('accepted', 'rejected') THEN
    RETURN NEW;
  END IF;

  offer_sender_id := NEW.sender_id;

  -- Get the responder's name (the other participant in the conversation)
  SELECT CONCAT(p.first_name, ' ', p.last_name)
  INTO responder_name
  FROM conversations c
  JOIN profiles p ON p.id = CASE
    WHEN c.participant1_id = offer_sender_id THEN c.participant2_id
    ELSE c.participant1_id
  END
  WHERE c.id = NEW.conversation_id;

  IF NEW.offer_status = 'accepted' THEN
    notification_title := 'Offre acceptée 🎉';
    notification_body := COALESCE(responder_name, 'L''utilisateur') || ' a accepté votre offre de ' || COALESCE(NEW.offer_amount::text, '') || ' €';
  ELSE
    notification_title := 'Offre refusée';
    notification_body := COALESCE(responder_name, 'L''utilisateur') || ' a refusé votre offre de ' || COALESCE(NEW.offer_amount::text, '') || ' €';
  END IF;

  -- Respect message notification preferences
  IF NOT should_notify(offer_sender_id, 'message') THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, title, message, type, read)
  VALUES (offer_sender_id, notification_title, notification_body, 'message', false);

  PERFORM net.http_post(
    url := 'https://dgmqdovojzzbdovgkawu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbXFkb3Zvanp6YmRvdmdrYXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk2NzQxMiwiZXhwIjoyMDc1NTQzNDEyfQ.AuzqyVhSMkGGPl6Ps-VG7JGzfFW6OOxlJfTUw9i3NwA'
    ),
    body := jsonb_build_object(
      'user_id', offer_sender_id,
      'title', notification_title,
      'body', notification_body,
      'data', jsonb_build_object(
        'type', 'offer_response',
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'status', NEW.offer_status
      )
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_offer_response ON public.messages;
CREATE TRIGGER trg_notify_offer_response
AFTER UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_offer_response();
