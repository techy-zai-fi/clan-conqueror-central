import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Sport {
  id: string;
  name: string;
  icon: string;
  has_categories: boolean;
  is_team_event: boolean;
}

interface Standing {
  clan_name: string;
  matches_played: number;
  matches_won: number;
  matches_drawn: number;
  matches_lost: number;
  total_points: number;
}

export default function SportStandings() {
  const { sportId } = useParams();
  const [sport, setSport] = useState<Sport | null>(null);
  const [groupAStandings, setGroupAStandings] = useState<Standing[]>([]);
  const [groupBStandings, setGroupBStandings] = useState<Standing[]>([]);
  const [category, setCategory] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSportAndCategories();
  }, [sportId]);

  useEffect(() => {
    if (category) {
      fetchStandings();
    }
  }, [category]);

  const fetchSportAndCategories = async () => {
    if (!sportId) return;
    setLoading(true);

    // Fetch sport details
    const { data: sportData } = await supabase
      .from('sports')
      .select('*')
      .eq('id', sportId)
      .single();

    if (sportData) setSport(sportData);

    if (sportData?.has_categories) {
      // Fetch distinct categories that have standings for this sport
      const { data: categoriesData } = await supabase
        .from('league_standings')
        .select('category')
        .eq('sport_id', sportId)
        .not('category', 'is', null)
        .not('category', 'eq', '');

      const uniqueCategories = [...new Set(categoriesData?.map(c => c.category).filter(Boolean))] as string[];
      setAvailableCategories(uniqueCategories);
      
      // Set first available category as default
      if (uniqueCategories.length > 0 && !category) {
        setCategory(uniqueCategories[0]);
      } else if (uniqueCategories.length === 0) {
        setLoading(false);
      }
    } else {
      setAvailableCategories([]);
      setCategory('none');
    }
  };

  const fetchStandings = async () => {
    if (!sportId || !sport) return;

    let groupAQuery = supabase
      .from('league_standings')
      .select('*')
      .eq('sport_id', sportId)
      .eq('group_name', 'A')
      .order('total_points', { ascending: false });

    let groupBQuery = supabase
      .from('league_standings')
      .select('*')
      .eq('sport_id', sportId)
      .eq('group_name', 'B')
      .order('total_points', { ascending: false });

    if (sport?.has_categories && category !== 'none') {
      groupAQuery = groupAQuery.eq('category', category);
      groupBQuery = groupBQuery.eq('category', category);
    } else {
      groupAQuery = groupAQuery.or('category.is.null,category.eq.');
      groupBQuery = groupBQuery.or('category.is.null,category.eq.');
    }

    const { data: groupAData } = await groupAQuery;
    const { data: groupBData } = await groupBQuery;

    if (groupAData) setGroupAStandings(groupAData);
    if (groupBData) setGroupBStandings(groupBData);
    setLoading(false);
  };

  const StandingsTable = ({ standings, groupName }: { standings: Standing[]; groupName: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Group {groupName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Position</TableHead>
              <TableHead className="text-foreground">Clan</TableHead>
              <TableHead className="text-center text-foreground">Played</TableHead>
              <TableHead className="text-center text-foreground">Won</TableHead>
              <TableHead className="text-center text-foreground">Draw</TableHead>
              <TableHead className="text-center text-foreground">Lost</TableHead>
              <TableHead className="text-center text-foreground">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No standings data available
                </TableCell>
              </TableRow>
            ) : (
              standings.map((standing, index) => (
                <TableRow key={standing.clan_name}>
                  <TableCell className="text-foreground font-bold">
                    {index < 2 && <Badge variant="default" className="mr-2">Q</Badge>}
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-foreground font-semibold">{standing.clan_name}</TableCell>
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
        {standings.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4">
            <Badge variant="default" className="mr-2">Q</Badge> indicates teams qualified for semifinals
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-foreground">Loading standings...</p>
        </div>
      </div>
    );
  }

  if (!sport) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-foreground">Sport not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="text-6xl mb-4">{sport.icon}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {sport.name} <span className="text-accent">Standings</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            League Stage Points Table
          </p>
        </div>

        {sport.has_categories && availableCategories.length > 0 ? (
          <Tabs value={category} onValueChange={setCategory} className="w-full">
            <TabsList className={`grid w-full max-w-md mx-auto mb-8 grid-cols-${availableCategories.length}`}>
              {availableCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-foreground capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={category}>
              <div className="grid md:grid-cols-2 gap-6">
                <StandingsTable standings={groupAStandings} groupName="A" />
                <StandingsTable standings={groupBStandings} groupName="B" />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <StandingsTable standings={groupAStandings} groupName="A" />
            <StandingsTable standings={groupBStandings} groupName="B" />
          </div>
        )}

        <Card className="mt-8 bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-foreground">Tournament Format</CardTitle>
          </CardHeader>
          <CardContent className="text-foreground">
            <ul className="space-y-2">
              <li>• <strong>League Stage:</strong> Teams divided into Group A and Group B (3 teams each)</li>
              <li>• <strong>Points System:</strong> Win = 2 points, Draw = 1 point, Loss = 0 points</li>
              <li>• <strong>Semifinals:</strong> Top 2 teams from each group qualify (A1 vs B2, A2 vs B1)</li>
              <li>• <strong>Finals:</strong> Winners of semifinals compete for Gold & Silver medals</li>
              <li>• <strong>3rd Place:</strong> Losers of semifinals compete for Bronze medal</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
