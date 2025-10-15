-- Add missing columns to clans table
ALTER TABLE public.clans 
ADD COLUMN IF NOT EXISTS bg_image text,
ADD COLUMN IF NOT EXISTS display_order integer,
ADD COLUMN IF NOT EXISTS sub_color text;

-- Add missing columns to clan_members table
ALTER TABLE public.clan_members 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS reg_num text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS batch text,
ADD COLUMN IF NOT EXISTS year integer;

-- Create unique constraint on reg_num if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clan_members_reg_num_key'
  ) THEN
    ALTER TABLE public.clan_members ADD CONSTRAINT clan_members_reg_num_key UNIQUE (reg_num);
  END IF;
END $$;