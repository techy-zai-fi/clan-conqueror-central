-- Create footer settings table
CREATE TABLE public.footer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'IT Committee IIM Bodh Gaya',
  about_text TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  copyright_text TEXT,
  show_social_links BOOLEAN DEFAULT true,
  show_newsletter BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Footer settings are viewable by everyone" 
ON public.footer_settings 
FOR SELECT 
USING (true);

-- Policy for admin update
CREATE POLICY "Admins can update footer settings" 
ON public.footer_settings 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy for admin insert
CREATE POLICY "Admins can insert footer settings" 
ON public.footer_settings 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Add trigger for timestamps
CREATE TRIGGER update_footer_settings_updated_at
BEFORE UPDATE ON public.footer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default footer settings
INSERT INTO public.footer_settings (
  company_name,
  about_text,
  contact_email,
  address,
  copyright_text
) VALUES (
  'IT Committee IIM Bodh Gaya',
  'Leading the digital transformation at IIM Bodh Gaya through innovation and technology.',
  'contact@iimbg.ac.in',
  'IIM Bodh Gaya, Uruvela, Bodh Gaya, Bihar 824234',
  '© {year} IT Committee IIM Bodh Gaya. All rights reserved.'
);