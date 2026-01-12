import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Sport {
  id: string;
  name: string;
  has_categories: boolean;
}

interface Match {
  id: string;
  clan1: string;
  clan2: string;
  date: string;
  time: string;
  stage: string;
  status: string;
}

interface PlayoffStage {
  id: string;
  sport_id: string;
  stage: string;
  category: string | null;
  position: number;
  match_id: string | null;
}

export default function AdminPlayoffs() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('none');
  const [playoffStages, setPlayoffStages] = useState<PlayoffStage[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshPlayoffPoints = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.rpc('recalculate_playoff_points');
      if (error) throw error;
      toast.success('Playoff points recalculated successfully!');
    } catch (error) {
      console.error('Error refreshing points:', error);
      toast.error('Failed to refresh points');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchPlayoffStages();
      fetchMatches();
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

  const fetchPlayoffStages = async () => {
    try {
      const sport = sports.find(s => s.id === selectedSport);
      const categoryFilter = sport?.has_categories && selectedCategory !== 'none' ? selectedCategory : null;

      const { data, error } = await supabase
        .from('knockout_stages')
        .select('*')
        .eq('sport_id', selectedSport)
        .eq('category', categoryFilter)
        .order('stage')
        .order('position');

      if (error) throw error;
      setPlayoffStages(data || []);
    } catch (error: any) {
      toast.error('Error loading playoff stages');
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('sport_id', selectedSport)
        .in('stage', ['semifinal', 'final', 'third_place'])
        .order('date');

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast.error('Error loading matches');
    }
  };

  const handleAssignMatch = async (stageId: string, matchId: string) => {
    try {
      const { error } = await supabase
        .from('knockout_stages')
        .update({ match_id: matchId || null })
        .eq('id', stageId);

      if (error) throw error;
      toast.success('Match assigned successfully');
      fetchPlayoffStages();
    } catch (error: any) {
      toast.error('Error assigning match');
    }
  };

  const createPlayoffSlots = async () => {
    try {
      const sport = sports.find(s => s.id === selectedSport);
      const categoryValue = sport?.has_categories && selectedCategory !== 'none' ? selectedCategory : null;

      const stages = [
        { stage: 'semifinal', position: 1 },
        { stage: 'semifinal', position: 2 },
        { stage: 'third_place', position: 1 },
        { stage: 'final', position: 1 },
      ];

      const { error } = await supabase
        .from('knockout_stages')
        .insert(
          stages.map(s => ({
            sport_id: selectedSport,
            category: categoryValue,
            stage: s.stage,
            position: s.position,
          }))
        );

      if (error) throw error;
      toast.success('Playoff slots created');
      fetchPlayoffStages();
    } catch (error: any) {
      toast.error('Error creating playoff slots');
    }
  };

  const selectedSportData = sports.find(s => s.id === selectedSport);
  const semifinals = playoffStages.filter(k => k.stage === 'semifinal');
  const thirdPlace = playoffStages.find(k => k.stage === 'third_place');
  const final = playoffStages.find(k => k.stage === 'final');

  if (loading) {
    return <div className="text-center text-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Playoffs</h2>
          <p className="text-muted-foreground">
            Manage semifinals, third place, and final matches for each sport
          </p>
        </div>
        <Button 
          onClick={handleRefreshPlayoffPoints} 
          variant="outline" 
          className="gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Recalculating...' : 'Refresh Playoff Points'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground mb-2 block">Select Sport</Label>
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
            <Label className="text-foreground mb-2 block">Select Category (Optional)</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {playoffStages.length === 0 && (
        <Button onClick={createPlayoffSlots}>
          Create Playoff Slots
        </Button>
      )}

      {playoffStages.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Semifinals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Position</TableHead>
                    <TableHead className="text-foreground">Assigned Match</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semifinals.map((sf) => {
                    const match = matches.find(m => m.id === sf.match_id);
                    return (
                      <TableRow key={sf.id}>
                        <TableCell className="text-foreground">Semifinal {sf.position}</TableCell>
                        <TableCell className="text-foreground">
                          {match ? `${match.clan1} vs ${match.clan2}` : 'Not assigned'}
                        </TableCell>
                        <TableCell>
                    <Select
                      value={sf.match_id || 'none'}
                      onValueChange={(value) => handleAssignMatch(sf.id, value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Assign match" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {matches
                          .filter(m => m.stage === 'semifinal')
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.clan1} vs {m.clan2} - {m.date}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Third Place Match</CardTitle>
            </CardHeader>
            <CardContent>
              {thirdPlace && (
                <div className="flex items-center gap-4">
                  <span className="text-foreground">Assigned Match:</span>
                  <Select
                    value={thirdPlace.match_id || 'none'}
                    onValueChange={(value) => handleAssignMatch(thirdPlace.id, value === 'none' ? '' : value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Assign match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {matches
                        .filter(m => m.stage === 'third_place')
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.clan1} vs {m.clan2} - {m.date}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Final</CardTitle>
            </CardHeader>
            <CardContent>
              {final && (
                <div className="flex items-center gap-4">
                  <span className="text-foreground">Assigned Match:</span>
                  <Select
                    value={final.match_id || 'none'}
                    onValueChange={(value) => handleAssignMatch(final.id, value === 'none' ? '' : value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Assign match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {matches
                        .filter(m => m.stage === 'final')
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.clan1} vs {m.clan2} - {m.date}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}