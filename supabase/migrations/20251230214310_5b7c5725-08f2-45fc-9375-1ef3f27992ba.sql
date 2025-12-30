-- Ajouter une table pour les paramètres numériques
CREATE TABLE IF NOT EXISTS public.app_settings_numeric (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text NOT NULL UNIQUE,
    setting_value integer NOT NULL DEFAULT 0,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings_numeric ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Settings viewable by everyone" 
ON public.app_settings_numeric 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update settings" 
ON public.app_settings_numeric 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert settings" 
ON public.app_settings_numeric 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default value for free listings limit
INSERT INTO public.app_settings_numeric (setting_key, setting_value, description)
VALUES ('free_listings_limit', 5, 'Nombre maximum d''annonces gratuites par mois par utilisateur');