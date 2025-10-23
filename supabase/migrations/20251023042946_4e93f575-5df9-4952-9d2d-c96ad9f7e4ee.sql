-- Create clan_panchs table to store clan leaders
CREATE TABLE IF NOT EXISTS public.clan_panchs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text NOT NULL,
  image_url text,
  display_order integer NOT NULL CHECK (display_order >= 1 AND display_order <= 5),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(clan_id, display_order)
);

-- Enable RLS
ALTER TABLE public.clan_panchs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view clan panchs
CREATE POLICY "Anyone can view clan panchs"
ON public.clan_panchs
FOR SELECT
USING (true);

-- Only admins can manage clan panchs
CREATE POLICY "Admins can manage clan panchs"
ON public.clan_panchs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_clan_panchs_updated_at
BEFORE UPDATE ON public.clan_panchs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_clan_panchs_clan_id ON public.clan_panchs(clan_id);

-- Add constraint to limit 5 panchs per clan
CREATE OR REPLACE FUNCTION check_clan_panchs_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.clan_panchs WHERE clan_id = NEW.clan_id) >= 5 THEN
    RAISE EXCEPTION 'Each clan can only have 5 panchs';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_clan_panchs_limit
BEFORE INSERT ON public.clan_panchs
FOR EACH ROW
EXECUTE FUNCTION check_clan_panchs_limit();