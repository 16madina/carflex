-- Fix search_path for increment_promo_code_usage function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;