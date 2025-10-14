-- Add policy to allow admins to create premium listings for anyone
DROP POLICY IF EXISTS "Admins can create premium listings for anyone" ON public.premium_listings;

CREATE POLICY "Admins can create premium listings for anyone"
  ON public.premium_listings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update sale_listings to add a demo seller_id column for listings without one
-- We'll use a system user ID for demo purposes
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Try to get the first user from auth.users
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
  
  -- Update listings without seller_id
  IF demo_user_id IS NOT NULL THEN
    UPDATE sale_listings 
    SET seller_id = demo_user_id 
    WHERE seller_id IS NULL;
  END IF;
END $$;