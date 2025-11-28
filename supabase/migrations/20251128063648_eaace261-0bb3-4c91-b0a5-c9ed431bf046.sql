-- Add ITCOM logo field to site_settings table
ALTER TABLE site_settings 
ADD COLUMN itcom_logo_url TEXT;

COMMENT ON COLUMN site_settings.itcom_logo_url IS 'Logo URL for ITCOM branding shown in hero section';