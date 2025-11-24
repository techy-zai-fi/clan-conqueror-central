import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Standing {
  id: string;
  sport_id: string;
  category: string | null;
  group_name: string;
  clan_name: string;
  matches_played: number;
  matches_won: number;
  matches_drawn: number;
  matches_lost: number;
  total_points: number;
}

interface Sport {
  id: string;
  name: string;
  has_categories: boolean;
}

export default function AdminLeagueStandings() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchStandings();
    }
  }, [selectedSport, selectedCategory]);

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name');

      if (error) throw error;
      setSports(data || []);
      if (data && data.length > 0) {
        setSelectedSport(data[0].id);
      }
    } catch (error: any) {
      toast.error('Error loading sports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStandings = async () => {
    try {
      const sport = sports.find(s => s.id === selectedSport);
      const categoryFilter = sport?.has_categories && selectedCategory !== 'all' ? selectedCategory : null;

      const { data, error } = await supabase
        .from('league_standings')
        .select('*')
        .eq('sport_id', selectedSport)
        .eq('category', categoryFilter)
        .order('group_name')
        .order('total_points', { ascending: false });

      if (error) throw error;
      setStandings(data || []);
    } catch (error: any) {
      toast.error('Error loading standings');
    }
  };

  const groupAStandings = standings.filter(s => s.group_name === 'A');
  const groupBStandings = standings.filter(s => s.group_name === 'B');
  const selectedSportData = sports.find(s => s.id === selectedSport);

  const StandingsTable = ({ standings, groupName }: { standings: Standing[]; groupName: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Group {groupName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Pos</TableHead>
              <TableHead className="text-foreground">Clan</TableHead>
              <TableHead className="text-center text-foreground">P</TableHead>
              <TableHead className="text-center text-foreground">W</TableHead>
              <TableHead className="text-center text-foreground">D</TableHead>
              <TableHead className="text-center text-foreground">L</TableHead>
              <TableHead className="text-center text-foreground">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              standings.map((standing, index) => (
                <TableRow key={standing.id}>
                  <TableCell className="text-foreground font-bold">{index + 1}</TableCell>
                  <TableCell className="text-foreground">{standing.clan_name}</TableCell>
                  <TableCell className="text-center text-foreground">{standing.matches_played}</TableCell>
                  <TableCell className="text-center text-foreground">{standing.matches_won}</TableCell>
                  <TableCell className="text-center text-foreground">{standing.matches_drawn}</TableCell>
                  <TableCell className="text-center text-foreground">{standing.matches_lost}</TableCell>
                  <TableCell className="text-center text-accent font-bold">{standing.total_points}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center text-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">League Standings</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-foreground mb-2 block">Select Sport</label>
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport.id} value={sport.id}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSportData?.has_categories && (
          <div>
            <label className="text-sm text-foreground mb-2 block">Select Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <StandingsTable standings={groupAStandings} groupName="A" />
        <StandingsTable standings={groupBStandings} groupName="B" />
      </div>

      <Card className="mt-6 bg-secondary/20">
        <CardHeader>
          <CardTitle className="text-foreground">Points System</CardTitle>
        </CardHeader>
        <CardContent className="text-foreground">
          <ul className="space-y-1 text-sm">
            <li>• Win: 2 points</li>
            <li>• Draw: 1 point</li>
            <li>• Loss: 0 points</li>
            <li>• Top 2 teams from each group qualify for semifinals</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
