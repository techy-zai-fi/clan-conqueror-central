-- Add show_sponsors field to site_settings table
ALTER TABLE site_settings 
ADD COLUMN show_sponsors BOOLEAN DEFAULT true;

COMMENT ON COLUMN site_settings.show_sponsors IS 'Toggle to show/hide sponsors section on home page';