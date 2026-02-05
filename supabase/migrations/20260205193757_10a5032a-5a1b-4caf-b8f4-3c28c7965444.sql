-- Insert additional listing limits for different user types
INSERT INTO public.app_settings_numeric (setting_key, setting_value, description)
VALUES 
  ('free_listings_limit_dealer', 20, 'Nombre maximum d''annonces gratuites par mois pour les concessionnaires'),
  ('free_listings_limit_agent', 15, 'Nombre maximum d''annonces gratuites par mois pour les agents')
ON CONFLICT (setting_key) DO NOTHING;