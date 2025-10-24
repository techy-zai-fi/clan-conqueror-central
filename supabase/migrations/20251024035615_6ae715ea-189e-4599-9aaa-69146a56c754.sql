-- Create sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  website_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view sponsors
CREATE POLICY "Anyone can view sponsors"
ON public.sponsors
FOR SELECT
USING (true);

-- Only admins can manage sponsors
CREATE POLICY "Admins can manage sponsors"
ON public.sponsors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_sponsors_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_sponsors_display_order ON public.sponsors(display_order);