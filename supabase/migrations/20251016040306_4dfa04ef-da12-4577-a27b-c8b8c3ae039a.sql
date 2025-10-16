-- Create ad_banners table
CREATE TABLE public.ad_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can view active banners
CREATE POLICY "Active banners viewable by everyone"
ON public.ad_banners
FOR SELECT
USING (is_active = true);

-- Only admins can insert banners
CREATE POLICY "Only admins can insert banners"
ON public.ad_banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update banners
CREATE POLICY "Only admins can update banners"
ON public.ad_banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete banners
CREATE POLICY "Only admins can delete banners"
ON public.ad_banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public to increment click count
CREATE POLICY "Public can update click count"
ON public.ad_banners
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ad_banners_updated_at
BEFORE UPDATE ON public.ad_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for ad banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-banners', 'ad-banners', true);

-- Storage policies for ad banners
CREATE POLICY "Ad banner images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ad-banners');

CREATE POLICY "Admins can upload ad banners"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ad-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad banners"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ad-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad banners"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ad-banners' AND has_role(auth.uid(), 'admin'::app_role));

-- Insert demo insurance banner
INSERT INTO public.ad_banners (title, image_url, link_url, is_active)
VALUES (
  'Assurance Auto Afrique',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=200&fit=crop',
  'https://example.com/assurance-auto',
  true
);