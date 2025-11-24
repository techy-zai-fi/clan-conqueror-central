-- Add category and group support to sports
ALTER TABLE sports ADD COLUMN IF NOT EXISTS has_categories boolean DEFAULT false;
ALTER TABLE sports ADD COLUMN IF NOT EXISTS is_team_event boolean DEFAULT false;

-- Add category and tournament stage to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage text DEFAULT 'league';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name text;

-- Create league standings table
CREATE TABLE IF NOT EXISTS league_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE NOT NULL,
  category text,
  group_name text NOT NULL,
  clan_name text NOT NULL,
  matches_played integer DEFAULT 0,
  matches_won integer DEFAULT 0,
  matches_drawn integer DEFAULT 0,
  matches_lost integer DEFAULT 0,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sport_id, category, group_name, clan_name)
);

-- Create knockout matches table for tracking semifinals, 3rd place, finals
CREATE TABLE IF NOT EXISTS knockout_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE NOT NULL,
  category text,
  stage text NOT NULL, -- 'semifinal', 'third_place', 'final'
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  position integer, -- 1 or 2 for semifinals
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add medal tracking to clans table
ALTER TABLE clans ADD COLUMN IF NOT EXISTS gold_medals integer DEFAULT 0;
ALTER TABLE clans ADD COLUMN IF NOT EXISTS silver_medals integer DEFAULT 0;
ALTER TABLE clans ADD COLUMN IF NOT EXISTS bronze_medals integer DEFAULT 0;

-- Create team event results table (for badminton, TT with multiple events)
CREATE TABLE IF NOT EXISTS team_event_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  event_name text NOT NULL,
  clan1_score integer DEFAULT 0,
  clan2_score integer DEFAULT 0,
  winner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_event_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for league_standings
CREATE POLICY "Anyone can view league standings"
  ON league_standings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage league standings"
  ON league_standings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for knockout_stages
CREATE POLICY "Anyone can view knockout stages"
  ON knockout_stages FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage knockout stages"
  ON knockout_stages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for team_event_results
CREATE POLICY "Anyone can view team event results"
  ON team_event_results FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage team event results"
  ON team_event_results FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update league standings
CREATE OR REPLACE FUNCTION update_league_standings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if match is in league stage and has a result
  IF NEW.stage = 'league' AND NEW.status = 'completed' AND NEW.score1 IS NOT NULL AND NEW.score2 IS NOT NULL THEN
    -- Update clan1 standings
    INSERT INTO league_standings (sport_id, category, group_name, clan_name, matches_played, matches_won, matches_drawn, matches_lost, total_points)
    VALUES (
      NEW.sport_id,
      NEW.category,
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
      NEW.category,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic standings update
DROP TRIGGER IF EXISTS update_standings_on_match_result ON matches;
CREATE TRIGGER update_standings_on_match_result
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_league_standings();

-- Create function to update medals
CREATE OR REPLACE FUNCTION update_clan_medals()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if match is final stage and has a winner
  IF NEW.stage = 'final' AND NEW.status = 'completed' AND NEW.winner IS NOT NULL THEN
    -- Gold for winner
    UPDATE clans 
    SET gold_medals = gold_medals + 1,
        total_points = total_points + 25
    WHERE name = NEW.winner;
    
    -- Silver for runner-up
    UPDATE clans 
    SET silver_medals = silver_medals + 1,
        total_points = total_points + 15
    WHERE name = CASE WHEN NEW.winner = NEW.clan1 THEN NEW.clan2 ELSE NEW.clan1 END;
  END IF;
  
  -- Bronze for 3rd place winner
  IF NEW.stage = 'third_place' AND NEW.status = 'completed' AND NEW.winner IS NOT NULL THEN
    UPDATE clans 
    SET bronze_medals = bronze_medals + 1,
        total_points = total_points + 10
    WHERE name = NEW.winner;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic medal update
DROP TRIGGER IF EXISTS update_medals_on_final_result ON matches;
CREATE TRIGGER update_medals_on_final_result
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_clan_medals();