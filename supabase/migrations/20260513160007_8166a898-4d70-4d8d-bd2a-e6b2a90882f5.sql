
CREATE TABLE public.search_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  listing_type text NOT NULL DEFAULT 'sale',
  brand text,
  model text,
  min_price numeric,
  max_price numeric,
  min_year integer,
  max_year integer,
  max_mileage integer,
  fuel_type text,
  transmission text,
  body_type text,
  country text,
  city text,
  is_active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own alerts" ON public.search_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own alerts" ON public.search_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.search_alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON public.search_alerts
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON public.search_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_search_alerts_user ON public.search_alerts(user_id);
CREATE INDEX idx_search_alerts_active ON public.search_alerts(is_active) WHERE is_active = true;

CREATE TRIGGER update_search_alerts_updated_at
  BEFORE UPDATE ON public.search_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
