-- Fix recalculate_playoff_points function with proper WHERE clauses
CREATE OR REPLACE FUNCTION public.recalculate_playoff_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE clans 
  SET 
    total_points = 0,
    gold_medals = 0,
    silver_medals = 0,
    bronze_medals = 0
  WHERE true;

  UPDATE clans c
  SET 
    gold_medals = subquery.gold_count,
    total_points = c.total_points + (subquery.gold_count * 25)
  FROM (
    SELECT winner, COUNT(*) as gold_count
    FROM matches
    WHERE stage = 'final' 
      AND status = 'completed' 
      AND winner IS NOT NULL
    GROUP BY winner
  ) subquery
  WHERE c.name = subquery.winner;

  UPDATE clans c
  SET 
    silver_medals = subquery.silver_count,
    total_points = c.total_points + (subquery.silver_count * 15)
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

  UPDATE clans c
  SET 
    bronze_medals = subquery.bronze_count,
    total_points = c.total_points + (subquery.bronze_count * 10)
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
