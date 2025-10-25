-- Add member_id to clan_panchs to track which clan member was selected
ALTER TABLE public.clan_panchs
ADD COLUMN member_id uuid REFERENCES public.clan_members(id) ON DELETE SET NULL;