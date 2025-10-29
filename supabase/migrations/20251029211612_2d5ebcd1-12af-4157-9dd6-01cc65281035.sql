-- Mettre à jour le plan Pro avec le nouveau prix et les nouveaux IDs Stripe
UPDATE subscription_plans 
SET 
  price = 10000,
  stripe_product_id = 'prod_TKLOMMZcXj019b',
  stripe_price_id = 'price_1SNgi90uNiBPsOk0kPKeEO0T',
  updated_at = NOW()
WHERE name = 'Pro';