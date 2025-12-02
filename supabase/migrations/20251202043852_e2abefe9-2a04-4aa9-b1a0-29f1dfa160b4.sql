-- Create trigger to recalculate league standings on match changes
CREATE TRIGGER recalculate_standings_on_match_insert
AFTER INSERT ON public.matches
FOR EACH ROW
WHEN (NEW.stage = 'league' AND NEW.group_name IS NOT NULL)
EXECUTE FUNCTION public.recalculate_league_standings();

CREATE TRIGGER recalculate_standings_on_match_update
AFTER UPDATE ON public.matches
FOR EACH ROW
WHEN (
  (OLD.stage = 'league' OR NEW.stage = 'league') 
  AND (OLD.group_name IS NOT NULL OR NEW.group_name IS NOT NULL)
)
EXECUTE FUNCTION public.recalculate_league_standings();

CREATE TRIGGER recalculate_standings_on_match_delete
AFTER DELETE ON public.matches
FOR EACH ROW
WHEN (OLD.stage = 'league' AND OLD.group_name IS NOT NULL)
EXECUTE FUNCTION public.recalculate_league_standings();