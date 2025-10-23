-- Fix search_path for security
CREATE OR REPLACE FUNCTION check_clan_panchs_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.clan_panchs WHERE clan_id = NEW.clan_id) >= 5 THEN
    RAISE EXCEPTION 'Each clan can only have 5 panchs';
  END IF;
  RETURN NEW;
END;
$$;