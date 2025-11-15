-- Add hero_logo_url field to site_settings table
ALTER TABLE site_settings
ADD COLUMN hero_logo_url text;