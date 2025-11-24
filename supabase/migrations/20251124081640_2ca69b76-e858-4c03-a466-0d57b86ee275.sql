-- Drop all existing triggers first
DROP TRIGGER IF EXISTS update_league_standings_trigger ON matches;
DROP TRIGGER IF EXISTS update_standings_on_match_result ON matches;

-- Now drop the function with CASCADE to ensure clean removal
DROP FUNCTION IF EXISTS update_league_standings() CASCADE;

-- Create a function to recalculate league standings from scratch
CREATE OR REPLACE FUNCTION recalculate_league_standings()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing standings for the affected sport/category/group
  DELETE FROM league_standings 
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id)
    AND category = COALESCE(NEW.category, OLD.category, '')
    AND group_name = COALESCE(NEW.group_name, OLD.group_name);

  -- Recalculate standings from all completed league matches
  INSERT INTO league_standings (sport_id, category, group_name, clan_name, matches_played, matches_won, matches_drawn, matches_lost, total_points)
  SELECT 
    sport_id,
    COALESCE(category, '') as category,
    group_name,
    clan_name,
    COUNT(*) as matches_played,
    SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as matches_won,
    SUM(CASE WHEN drawn = 1 THEN 1 ELSE 0 END) as matches_drawn,
    SUM(CASE WHEN lost = 1 THEN 1 ELSE 0 END) as matches_lost,
    SUM(points) as total_points
  FROM (
    -- Clan 1 results
    SELECT 
      sport_id,
      category,
      group_name,
      clan1 as clan_name,
      CASE WHEN score1 > score2 THEN 1 ELSE 0 END as won,
      CASE WHEN score1 = score2 THEN 1 ELSE 0 END as drawn,
      CASE WHEN score1 < score2 THEN 1 ELSE 0 END as lost,
      CASE WHEN score1 > score2 THEN 2 WHEN score1 = score2 THEN 1 ELSE 0 END as points
    FROM matches
    WHERE stage = 'league' 
      AND status = 'completed'
      AND score1 IS NOT NULL 
      AND score2 IS NOT NULL
      AND group_name IS NOT NULL
      AND sport_id = COALESCE(NEW.sport_id, OLD.sport_id)
      AND COALESCE(category, '') = COALESCE(NEW.category, OLD.category, '')
      AND group_name = COALESCE(NEW.group_name, OLD.group_name)
    
    UNION ALL
    
    -- Clan 2 results
    SELECT 
      sport_id,
      category,
      group_name,
      clan2 as clan_name,
      CASE WHEN score2 > score1 THEN 1 ELSE 0 END as won,
      CASE WHEN score2 = score1 THEN 1 ELSE 0 END as drawn,
      CASE WHEN score2 < score1 THEN 1 ELSE 0 END as lost,
      CASE WHEN score2 > score1 THEN 2 WHEN score2 = score1 THEN 1 ELSE 0 END as points
    FROM matches
    WHERE stage = 'league' 
      AND status = 'completed'
      AND score1 IS NOT NULL 
      AND score2 IS NOT NULL
      AND group_name IS NOT NULL
      AND sport_id = COALESCE(NEW.sport_id, OLD.sport_id)
      AND COALESCE(category, '') = COALESCE(NEW.category, OLD.category, '')
      AND group_name = COALESCE(NEW.group_name, OLD.group_name)
  ) all_results
  GROUP BY sport_id, category, group_name, clan_name
  ON CONFLICT (sport_id, category, group_name, clan_name) 
  DO UPDATE SET
    matches_played = EXCLUDED.matches_played,
    matches_won = EXCLUDED.matches_won,
    matches_drawn = EXCLUDED.matches_drawn,
    matches_lost = EXCLUDED.matches_lost,
    total_points = EXCLUDED.total_points,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for INSERT, UPDATE, and DELETE
CREATE TRIGGER recalculate_standings_on_insert
  AFTER INSERT ON matches
  FOR EACH ROW
  WHEN (NEW.stage = 'league' AND NEW.group_name IS NOT NULL)
  EXECUTE FUNCTION recalculate_league_standings();

CREATE TRIGGER recalculate_standings_on_update
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN ((NEW.stage = 'league' OR OLD.stage = 'league') AND (NEW.group_name IS NOT NULL OR OLD.group_name IS NOT NULL))
  EXECUTE FUNCTION recalculate_league_standings();

CREATE TRIGGER recalculate_standings_on_delete
  AFTER DELETE ON matches
  FOR EACH ROW
  WHEN (OLD.stage = 'league' AND OLD.group_name IS NOT NULL)
  EXECUTE FUNCTION recalculate_league_standings();