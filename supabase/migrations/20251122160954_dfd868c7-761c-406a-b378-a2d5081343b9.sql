-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  test_drive_enabled boolean DEFAULT true,
  message_enabled boolean DEFAULT true,
  booking_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON public.notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.notification_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check if user wants a notification type
CREATE OR REPLACE FUNCTION public.should_notify(p_user_id uuid, p_notification_type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_preferences record;
BEGIN
  -- Get user preferences, default to true if not set
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences exist, allow all notifications
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Check specific notification type
  CASE p_notification_type
    WHEN 'test_drive' THEN
      RETURN v_preferences.test_drive_enabled;
    WHEN 'message' THEN
      RETURN v_preferences.message_enabled;
    WHEN 'booking' THEN
      RETURN v_preferences.booking_enabled;
    ELSE
      RETURN true;
  END CASE;
END;
$$;