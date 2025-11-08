-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'xof',
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active plans
CREATE POLICY "Active plans viewable by everyone"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Only admins can insert plans
CREATE POLICY "Only admins can insert plans"
ON public.subscription_plans
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update plans
CREATE POLICY "Only admins can update plans"
ON public.subscription_plans
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete plans
CREATE POLICY "Only admins can delete plans"
ON public.subscription_plans
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Insert the Pro plan with current configuration
INSERT INTO public.subscription_plans (
  name,
  stripe_product_id,
  stripe_price_id,
  price,
  currency,
  description,
  features,
  display_order
) VALUES (
  'Pro',
  'prod_TIUlPB2L1UM6R9',
  'price_1SLtlu0AuGiXnde2SSChEvyE',
  10000,
  'xof',
  'Abonnement Pro mensuel avec annonces illimitées et boost de visibilité',
  '["Annonces illimitées", "Boost de visibilité (apparaît en premier)", "Badge ''Pro'' sur vos annonces", "Statistiques avancées", "Priorité dans les résultats de recherche", "Support prioritaire"]'::jsonb,
  1
);

-- Create updated_at trigger
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();