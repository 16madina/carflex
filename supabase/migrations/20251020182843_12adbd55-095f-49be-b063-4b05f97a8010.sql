-- Ajouter le paramètre pour activer/désactiver la limite de 5 annonces gratuites
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES (
  'enable_free_listings_limit',
  true,
  'Active la limite de 5 annonces gratuites maximum par utilisateur'
)
ON CONFLICT (setting_key) DO NOTHING;