-- Update the function to use WHERE clause for DELETE
CREATE OR REPLACE FUNCTION public.recalculate_all_league_standings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear all existing league standings (WHERE true to satisfy PostgREST)
  DELETE FROM league_standings WHERE true;

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
    
    UNION ALL
    
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
  ) all_results
  GROUP BY sport_id, category, group_name, clan_name;
END;
$$;