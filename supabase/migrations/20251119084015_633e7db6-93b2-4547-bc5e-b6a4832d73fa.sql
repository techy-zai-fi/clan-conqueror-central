-- Update the handle_new_user function to also create a student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Automatically assign student role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Function to sync clan leader roles with panchs
CREATE OR REPLACE FUNCTION public.sync_clan_leader_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- If user_id is set, add clan_leader role
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, 'clan_leader')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- When panch is removed, remove clan_leader role if they're not a panch for any other clan
    IF OLD.user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.clan_panchs WHERE user_id = OLD.user_id AND id != OLD.id
    ) THEN
      DELETE FROM public.user_roles 
      WHERE user_id = OLD.user_id AND role = 'clan_leader';
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger for clan_panchs to sync roles
DROP TRIGGER IF EXISTS sync_clan_leader_on_panch ON public.clan_panchs;
CREATE TRIGGER sync_clan_leader_on_panch
  AFTER INSERT OR UPDATE OR DELETE ON public.clan_panchs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_clan_leader_roles();