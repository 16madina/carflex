-- Table pour stocker les codes promo iOS
CREATE TABLE IF NOT EXISTS public.ios_promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  offer_identifier TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX idx_ios_promo_codes_code ON public.ios_promo_codes(code);
CREATE INDEX idx_ios_promo_codes_active ON public.ios_promo_codes(is_active);

-- RLS policies
ALTER TABLE public.ios_promo_codes ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent lire les codes actifs
CREATE POLICY "Users can read active promo codes"
  ON public.ios_promo_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Fonction pour incrémenter les utilisations
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_uses INTEGER;
  v_current_uses INTEGER;
BEGIN
  -- Get current usage
  SELECT max_uses, current_uses 
  INTO v_max_uses, v_current_uses
  FROM ios_promo_codes
  WHERE code = p_code AND is_active = true;
  
  -- Check if code exists and hasn't reached max uses
  IF v_max_uses IS NULL OR v_current_uses < v_max_uses THEN
    -- Increment usage
    UPDATE ios_promo_codes
    SET current_uses = current_uses + 1,
        updated_at = now()
    WHERE code = p_code;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;