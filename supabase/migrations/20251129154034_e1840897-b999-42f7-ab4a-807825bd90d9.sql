-- Fix ad_banners RLS policies conflict
-- Drop the conflicting public update policy
DROP POLICY IF EXISTS "Public can update click count" ON public.ad_banners;

-- The increment_banner_clicks RPC function already handles click count updates securely
-- Now only admins can update banners (including is_active status)