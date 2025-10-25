-- Add video_url to clans table for intro videos
ALTER TABLE public.clans
ADD COLUMN video_url text;