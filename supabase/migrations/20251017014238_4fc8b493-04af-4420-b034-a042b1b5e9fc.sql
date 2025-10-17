-- Create app_settings table to store configurable application parameters
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Settings are viewable by everyone"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update settings"
ON public.app_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Only admins can insert settings"
ON public.app_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert the default setting for vehicle evaluation restriction
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('restrict_vehicle_evaluation_to_pro', false, 'Restreindre l''évaluation de véhicule aux utilisateurs Pro uniquement')
ON CONFLICT (setting_key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();