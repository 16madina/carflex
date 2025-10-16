-- Create a secure function to increment banner clicks
CREATE OR REPLACE FUNCTION public.increment_banner_clicks(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ad_banners
  SET click_count = click_count + 1
  WHERE id = banner_id;
END;
$$;