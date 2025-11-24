-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_league_standings_trigger ON matches;

-- Update the function to handle NULL group_name properly
CREATE OR REPLACE FUNCTION public.update_league_standings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only update if match is in league stage, has a result, AND has a group_name
  IF NEW.stage = 'league' 
     AND NEW.status = 'completed' 
     AND NEW.score1 IS NOT NULL 
     AND NEW.score2 IS NOT NULL
     AND NEW.group_name IS NOT NULL THEN
    
    -- Update clan1 standings
    INSERT INTO league_standings (sport_id, category, group_name, clan_name, matches_played, matches_won, matches_drawn, matches_lost, total_points)
    VALUES (
      NEW.sport_id,
      COALESCE(NEW.category, ''),
      NEW.group_name,
      NEW.clan1,
      1,
      CASE WHEN NEW.score1 > NEW.score2 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score1 = NEW.score2 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score1 < NEW.score2 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score1 > NEW.score2 THEN 2 WHEN NEW.score1 = NEW.score2 THEN 1 ELSE 0 END
    )
    ON CONFLICT (sport_id, category, group_name, clan_name)
    DO UPDATE SET
      matches_played = league_standings.matches_played + 1,
      matches_won = league_standings.matches_won + CASE WHEN NEW.score1 > NEW.score2 THEN 1 ELSE 0 END,
      matches_drawn = league_standings.matches_drawn + CASE WHEN NEW.score1 = NEW.score2 THEN 1 ELSE 0 END,
      matches_lost = league_standings.matches_lost + CASE WHEN NEW.score1 < NEW.score2 THEN 1 ELSE 0 END,
      total_points = league_standings.total_points + CASE WHEN NEW.score1 > NEW.score2 THEN 2 WHEN NEW.score1 = NEW.score2 THEN 1 ELSE 0 END,
      updated_at = now();

    -- Update clan2 standings
    INSERT INTO league_standings (sport_id, category, group_name, clan_name, matches_played, matches_won, matches_drawn, matches_lost, total_points)
    VALUES (
      NEW.sport_id,
      COALESCE(NEW.category, ''),
      NEW.group_name,
      NEW.clan2,
      1,
      CASE WHEN NEW.score2 > NEW.score1 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score2 = NEW.score1 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score2 < NEW.score1 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score2 > NEW.score1 THEN 2 WHEN NEW.score2 = NEW.score1 THEN 1 ELSE 0 END
    )
    ON CONFLICT (sport_id, category, group_name, clan_name)
    DO UPDATE SET
      matches_played = league_standings.matches_played + 1,
      matches_won = league_standings.matches_won + CASE WHEN NEW.score2 > NEW.score1 THEN 1 ELSE 0 END,
      matches_drawn = league_standings.matches_drawn + CASE WHEN NEW.score2 = NEW.score1 THEN 1 ELSE 0 END,
      matches_lost = league_standings.matches_lost + CASE WHEN NEW.score2 < NEW.score1 THEN 1 ELSE 0 END,
      total_points = league_standings.total_points + CASE WHEN NEW.score2 > NEW.score1 THEN 2 WHEN NEW.score2 = NEW.score1 THEN 1 ELSE 0 END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on matches table for both INSERT and UPDATE
CREATE TRIGGER update_league_standings_trigger
AFTER INSERT OR UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_league_standings();