import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://byfduqxidezyyblpddbr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZmR1cXhpZGV6eXlibHBkZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDIzODQsImV4cCI6MjA3NDgxODM4NH0.UuJURG_JV1rTY4B7Klfn12pl9mwnvog9zEXrjVC6HQ0'

const supabase = createClient(supabaseUrl, supabaseKey)

const sql = `
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
`

async function fixDatabase() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql })
    if (error) throw error
    console.log('✅ Database function updated successfully!')
  } catch (err) {
    console.error('Error executing SQL:', err)
  }
}

fixDatabase()
