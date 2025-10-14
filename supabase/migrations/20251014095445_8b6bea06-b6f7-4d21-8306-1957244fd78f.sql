-- Create clan_members table to store members of each clan
CREATE TABLE public.clan_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  name text NOT NULL,
  profile_image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create sport_team_members table to track which members participate in which sports
CREATE TABLE public.sport_team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.clan_members(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for clan_members
CREATE POLICY "Anyone can view clan members"
  ON public.clan_members
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage clan members"
  ON public.clan_members
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for sport_team_members
CREATE POLICY "Anyone can view sport team members"
  ON public.sport_team_members
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sport team members"
  ON public.sport_team_members
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on clan_members
CREATE TRIGGER update_clan_members_updated_at
  BEFORE UPDATE ON public.clan_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();