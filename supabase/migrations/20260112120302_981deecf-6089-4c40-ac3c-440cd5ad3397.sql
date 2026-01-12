-- Function to recalculate all playoff points from medals
CREATE OR REPLACE FUNCTION public.recalculate_playoff_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Reset all clan points and medals
  UPDATE clans 
  SET 
    total_points = 0,
    gold_medals = 0,
    silver_medals = 0,
    bronze_medals = 0;

  -- Recalculate gold medals and points from final winners
  UPDATE clans c
  SET 
    gold_medals = subquery.gold_count,
    total_points = total_points + (subquery.gold_count * 25)
  FROM (
    SELECT winner, COUNT(*) as gold_count
    FROM matches
    WHERE stage = 'final' 
      AND status = 'completed' 
      AND winner IS NOT NULL
    GROUP BY winner
  ) subquery
  WHERE c.name = subquery.winner;

  -- Recalculate silver medals and points from final losers
  UPDATE clans c
  SET 
    silver_medals = subquery.silver_count,
    total_points = total_points + (subquery.silver_count * 15)
  FROM (
    SELECT 
      CASE WHEN winner = clan1 THEN clan2 ELSE clan1 END as loser,
      COUNT(*) as silver_count
    FROM matches
    WHERE stage = 'final' 
      AND status = 'completed' 
      AND winner IS NOT NULL
    GROUP BY CASE WHEN winner = clan1 THEN clan2 ELSE clan1 END
  ) subquery
  WHERE c.name = subquery.loser;

  -- Recalculate bronze medals and points from third place winners
  UPDATE clans c
  SET 
    bronze_medals = subquery.bronze_count,
    total_points = total_points + (subquery.bronze_count * 10)
  FROM (
    SELECT winner, COUNT(*) as bronze_count
    FROM matches
    WHERE stage = 'third_place' 
      AND status = 'completed' 
      AND winner IS NOT NULL
    GROUP BY winner
  ) subquery
  WHERE c.name = subquery.winner;
END;
$$;