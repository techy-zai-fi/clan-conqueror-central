-- Add leaderboard type setting to site_settings
ALTER TABLE site_settings 
ADD COLUMN active_leaderboard_type text DEFAULT 'playoff' CHECK (active_leaderboard_type IN ('league', 'playoff'));