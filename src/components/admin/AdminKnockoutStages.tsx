import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface KnockoutStage {
  id: string;
  sport_id: string;
  stage: string;
  category: string | null;
  position: number;
  match_id: string | null;
}

export default function AdminKnockoutStages() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [knockoutStages, setKnockoutStages] = useState<KnockoutStage[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchKnockoutStages();
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

  const fetchKnockoutStages = async () => {
    try {
      const sport = sports.find(s => s.id === selectedSport);
      const categoryFilter = sport?.has_categories ? selectedCategory : null;

      const { data, error } = await supabase
        .from('knockout_stages')
        .select('*')
        .eq('sport_id', selectedSport)
        .eq('category', categoryFilter)
        .order('stage')
        .order('position');

      if (error) throw error;
      setKnockoutStages(data || []);
    } catch (error: any) {
      toast.error('Error loading knockout stages');
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
      fetchKnockoutStages();
    } catch (error: any) {
      toast.error('Error assigning match');
    }
  };

  const createKnockoutSlots = async () => {
    try {
      const sport = sports.find(s => s.id === selectedSport);
      const categoryValue = sport?.has_categories ? selectedCategory : null;

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
      toast.success('Knockout slots created');
      fetchKnockoutStages();
    } catch (error: any) {
      toast.error('Error creating knockout slots');
    }
  };

  const selectedSportData = sports.find(s => s.id === selectedSport);
  const semifinals = knockoutStages.filter(k => k.stage === 'semifinal');
  const thirdPlace = knockoutStages.find(k => k.stage === 'third_place');
  const final = knockoutStages.find(k => k.stage === 'final');

  if (loading) {
    return <div className="text-center text-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Knockout Stages</h2>
      <p className="text-muted-foreground">
        Manage semifinals, third place, and final matches for each sport
      </p>

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
            <Label className="text-foreground mb-2 block">Select Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {knockoutStages.length === 0 && (
        <Button onClick={createKnockoutSlots}>
          Create Knockout Slots
        </Button>
      )}

      {knockoutStages.length > 0 && (
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
                            value={sf.match_id || ''}
                            onValueChange={(value) => handleAssignMatch(sf.id, value)}
                          >
                            <SelectTrigger className="w-[300px]">
                              <SelectValue placeholder="Assign match" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
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
                    value={thirdPlace.match_id || ''}
                    onValueChange={(value) => handleAssignMatch(thirdPlace.id, value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Assign match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
                    value={final.match_id || ''}
                    onValueChange={(value) => handleAssignMatch(final.id, value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Assign match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
