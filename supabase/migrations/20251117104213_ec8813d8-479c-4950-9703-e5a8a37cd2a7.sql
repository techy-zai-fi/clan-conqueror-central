-- Create gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery
CREATE POLICY "Anyone can view gallery"
  ON public.gallery
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix footer_settings security issue - restrict to authenticated users
DROP POLICY IF EXISTS "Footer settings are viewable by everyone" ON public.footer_settings;

CREATE POLICY "Footer settings viewable by authenticated users"
  ON public.footer_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Add SELECT policy to user_roles for better security
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for gallery updated_at
CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();