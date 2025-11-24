-- Drop any existing triggers first
DROP TRIGGER IF EXISTS recalculate_standings_on_insert ON matches;
DROP TRIGGER IF EXISTS recalculate_standings_on_update ON matches;
DROP TRIGGER IF EXISTS recalculate_standings_on_delete ON matches;

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