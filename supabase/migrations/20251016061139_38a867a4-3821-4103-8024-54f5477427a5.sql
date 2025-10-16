-- Add a 2-char clan_code to clans table
ALTER TABLE public.clans ADD COLUMN clan_code TEXT UNIQUE;

-- Update clan_code to be NOT NULL after data migration
-- For now, we'll set it as nullable to allow existing data

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.clan_members DROP CONSTRAINT IF EXISTS clan_members_clan_id_fkey;

-- Change clan_id in clan_members from UUID to TEXT
ALTER TABLE public.clan_members ALTER COLUMN clan_id TYPE TEXT;

-- Add foreign key constraint linking clan_members.clan_id to clans.clan_code
ALTER TABLE public.clan_members ADD CONSTRAINT clan_members_clan_id_fkey 
  FOREIGN KEY (clan_id) REFERENCES public.clans(clan_code) ON DELETE CASCADE;

-- Add check constraint to ensure clan_code is exactly 2 characters
ALTER TABLE public.clans ADD CONSTRAINT clan_code_length_check 
  CHECK (length(clan_code) = 2);

-- Add check constraint to ensure clan_id in members is exactly 2 characters
ALTER TABLE public.clan_members ADD CONSTRAINT clan_id_length_check 
  CHECK (length(clan_id) = 2);