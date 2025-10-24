-- Add user_id to clan_panchs table to link panchs to user accounts
ALTER TABLE public.clan_panchs
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add tracking columns to sport_team_members
ALTER TABLE public.sport_team_members
ADD COLUMN updated_by uuid REFERENCES auth.users(id),
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Create function to check if a user is a panch for a specific clan
CREATE OR REPLACE FUNCTION public.is_panch_for_clan(_user_id uuid, _clan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clan_panchs
    WHERE user_id = _user_id
      AND clan_id = _clan_id
  )
$$;

-- Update RLS policy on sport_team_members to allow panchs to manage their clan's members
CREATE POLICY "Panchs can manage their clan team members"
ON public.sport_team_members
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  is_panch_for_clan(auth.uid(), clan_id)
);

-- Drop the old admin-only policy
DROP POLICY IF EXISTS "Admins can manage sport team members" ON public.sport_team_members;

-- Create trigger to update the updated_at and updated_by columns
CREATE OR REPLACE FUNCTION public.update_sport_team_members_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_sport_team_members_tracking_trigger
BEFORE UPDATE ON public.sport_team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_sport_team_members_tracking();

-- Also set updated_by on insert
CREATE OR REPLACE FUNCTION public.set_sport_team_members_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_sport_team_members_creator_trigger
BEFORE INSERT ON public.sport_team_members
FOR EACH ROW
EXECUTE FUNCTION public.set_sport_team_members_creator();