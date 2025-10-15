-- Create function to notify about new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
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

  -- Get sender's name
  SELECT CONCAT(first_name, ' ', last_name)
  INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification for the recipient
  INSERT INTO notifications (user_id, title, message, read)
  VALUES (
    recipient_id,
    'Nouveau message',
    sender_name || ' vous a envoyé un message',
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;