-- Add unique constraint on stripe_product_id if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscription_plans_stripe_product_id_key'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD CONSTRAINT subscription_plans_stripe_product_id_key UNIQUE (stripe_product_id);
  END IF;
END $$;

-- Add subscription tier limits to app_settings_numeric
INSERT INTO public.app_settings_numeric (setting_key, setting_value, description)
VALUES 
  ('pro_argent_listings_limit', 10, 'Nombre maximum d''annonces par mois pour les abonnés Pro Argent'),
  ('pro_argent_boost_limit', 3, 'Nombre de boosts gratuits par mois pour les abonnés Pro Argent'),
  ('pro_gold_listings_limit', 25, 'Nombre maximum d''annonces par mois pour les abonnés Pro Gold'),
  ('pro_gold_boost_limit', 5, 'Nombre de boosts gratuits par mois pour les abonnés Pro Gold')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();

-- Deactivate old plans
UPDATE public.subscription_plans SET is_active = false WHERE stripe_product_id NOT IN ('prod_TvPMpj9rsNw7A9', 'prod_TvPNJvVw9LiXVr');

-- Insert new Pro Argent plan
INSERT INTO public.subscription_plans (name, description, price, currency, stripe_product_id, stripe_price_id, features, is_active, display_order)
VALUES (
  'Pro Argent',
  'Plan Pro Argent - Idéal pour les vendeurs actifs',
  10000,
  'XOF',
  'prod_TvPMpj9rsNw7A9',
  'price_1SxYY60uNiBPsOk0WJdhIhgB',
  '["10 annonces par mois", "Boost de visibilité sur 3 annonces/mois", "Badge Pro sur vos annonces", "Statistiques avancées", "Priorité dans les résultats de recherche", "Support prioritaire"]'::jsonb,
  true,
  1
)
ON CONFLICT (stripe_product_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stripe_price_id = EXCLUDED.stripe_price_id,
  features = EXCLUDED.features,
  is_active = true,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Insert new Pro Gold plan
INSERT INTO public.subscription_plans (name, description, price, currency, stripe_product_id, stripe_price_id, features, is_active, display_order)
VALUES (
  'Pro Gold',
  'Plan Pro Gold - Pour les professionnels et concessionnaires',
  17500,
  'XOF',
  'prod_TvPNJvVw9LiXVr',
  'price_1SxYYi0uNiBPsOk0E6SzkaMI',
  '["25 annonces par mois", "Boost de visibilité sur 5 annonces/mois", "Badge Pro Premium sur vos annonces", "Statistiques avancées", "Priorité dans les résultats de recherche", "Support prioritaire"]'::jsonb,
  true,
  2
)
ON CONFLICT (stripe_product_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stripe_price_id = EXCLUDED.stripe_price_id,
  features = EXCLUDED.features,
  is_active = true,
  display_order = EXCLUDED.display_order,
  updated_at = now();