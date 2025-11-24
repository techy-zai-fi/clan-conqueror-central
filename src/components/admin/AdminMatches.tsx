import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CalendarIcon, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Match {
  id: string;
  sport_id: string;
  sport_name: string;
  clan1: string;
  clan2: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  score1: number | null;
  score2: number | null;
  winner: string | null;
  category?: string | null;
  group_name?: string | null;
  stage?: string;
}

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scoreData, setScoreData] = useState({
    score1: 0,
    score2: 0,
    status: 'live' as 'live' | 'completed',
    winner: '',
  });
  const [formData, setFormData] = useState({
    sport_id: '',
    sport_name: '',
    clan1: '',
    clan2: '',
    date: '',
    time: '',
    venue: '',
    status: 'upcoming' as 'upcoming' | 'live' | 'completed',
    score1: 0,
    score2: 0,
    winner: '',
    category: '',
    group_name: '',
    stage: 'league' as string,
  });

  useEffect(() => {
    fetchMatches();
    fetchSports();
    fetchClans();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMatches((data || []) as Match[]);
    } catch (error: any) {
      toast.error('Error loading matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*');

      if (error) throw error;
      setSports(data || []);
    } catch (error: any) {
      toast.error('Error loading sports');
    }
  };

  const fetchClans = async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('id, name, clan_code')
        .order('name');

      if (error) throw error;
      setClans(data || []);
    } catch (error: any) {
      toast.error('Error loading clans');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const matchData = {
        ...formData,
        score1: formData.status === 'upcoming' ? null : formData.score1,
        score2: formData.status === 'upcoming' ? null : formData.score2,
        winner: formData.status === 'completed' ? formData.winner : null,
      };

      if (editingMatch) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', editingMatch.id);

        if (error) throw error;
        
        // Update clan points if match is completed
        if (matchData.status === 'completed' && matchData.winner) {
          await updateClanPoints(matchData.winner);
        }
        
        toast.success('Match updated successfully');
      } else {
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);

        if (error) throw error;
        toast.success('Match created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchMatches();
    } catch (error: any) {
      toast.error(error.message || 'Error saving match');
    }
  };

  const handleScoreUpdate = async () => {
    if (!scoringMatch) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          score1: scoreData.score1,
          score2: scoreData.score2,
          status: scoreData.status,
          winner: scoreData.status === 'completed' ? scoreData.winner : null,
        })
        .eq('id', scoringMatch.id);

      if (error) throw error;

      if (scoreData.status === 'completed' && scoreData.winner) {
        await updateClanPoints(scoreData.winner);
      }

      toast.success('Score updated successfully');
      setScoreDialogOpen(false);
      setScoringMatch(null);
      fetchMatches();
    } catch (error: any) {
      toast.error('Error updating score');
    }
  };

  const openScoreDialog = (match: Match) => {
    setScoringMatch(match);
    setScoreData({
      score1: match.score1 || 0,
      score2: match.score2 || 0,
      status: match.status === 'upcoming' ? 'live' : match.status,
      winner: match.winner || '',
    });
    setScoreDialogOpen(true);
  };

  const updateClanPoints = async (winnerName: string) => {
    try {
      const { data: clan } = await supabase
        .from('clans')
        .select('total_points')
        .eq('name', winnerName)
        .single();
      
      if (clan) {
        await supabase
          .from('clans')
          .update({ total_points: (clan.total_points || 0) + 3 })
          .eq('name', winnerName);
      }
    } catch (error) {
      console.error('Error updating clan points:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Match deleted successfully');
      fetchMatches();
    } catch (error: any) {
      toast.error('Error deleting match');
    }
  };

  const resetForm = () => {
    setFormData({
      sport_id: '',
      sport_name: '',
      clan1: '',
      clan2: '',
      date: '',
      time: '',
      venue: '',
      status: 'upcoming',
      score1: 0,
      score2: 0,
      winner: '',
      category: '',
      group_name: '',
      stage: 'league',
    });
    setSelectedDate(undefined);
    setEditingMatch(null);
  };

  const openEditDialog = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      sport_id: match.sport_id,
      sport_name: match.sport_name,
      clan1: match.clan1,
      clan2: match.clan2,
      date: match.date,
      time: match.time,
      venue: match.venue,
      status: match.status,
      score1: match.score1 || 0,
      score2: match.score2 || 0,
      winner: match.winner || '',
      category: match.category || '',
      group_name: match.group_name || '',
      stage: match.stage || 'league',
    });
    // Try to parse the existing date if it's in a recognizable format
    try {
      const parsedDate = new Date(match.date);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    } catch (e) {
      setSelectedDate(undefined);
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="matches" className="w-full">
        <TabsList>
          <TabsTrigger value="matches">Manage Matches</TabsTrigger>
          <TabsTrigger value="scores">Update Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Manage Matches</h2>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Match
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMatch ? 'Edit Match' : 'Add New Match'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Sport</Label>
                    <Select
                      value={formData.sport_id}
                      onValueChange={(value) => {
                        const sport = sports.find(s => s.id === value);
                        setFormData({ 
                          ...formData, 
                          sport_id: value,
                          sport_name: sport?.name || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Clan 1</Label>
                      <Select
                        value={formData.clan1}
                        onValueChange={(value) => setFormData({ ...formData, clan1: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clan" />
                        </SelectTrigger>
                        <SelectContent>
                          {clans.map((clan) => (
                            <SelectItem key={clan.id} value={clan.name}>
                              {clan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Clan 2</Label>
                      <Select
                        value={formData.clan2}
                        onValueChange={(value) => setFormData({ ...formData, clan2: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clan" />
                        </SelectTrigger>
                        <SelectContent>
                          {clans.map((clan) => (
                            <SelectItem key={clan.id} value={clan.name}>
                              {clan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Venue</Label>
                    <Input
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="Match venue"
                      required
                    />
                  </div>

                  <div>
                    <Label>Stage</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) => setFormData({ ...formData, stage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league">League</SelectItem>
                        <SelectItem value="semifinal">Semifinal</SelectItem>
                        <SelectItem value="third_place">3rd Place</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.stage === 'league' && (
                    <>
                      <div>
                        <Label>Group (for League Stage)</Label>
                        <Select
                          value={formData.group_name}
                          onValueChange={(value) => setFormData({ ...formData, group_name: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Group A</SelectItem>
                            <SelectItem value="B">Group B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Category (Optional)</Label>
                      <Select
                        value={formData.category || 'none'}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value === 'none' ? '' : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status !== 'upcoming' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{formData.clan1} Score</Label>
                        <Input
                          type="number"
                          value={formData.score1}
                          onChange={(e) => setFormData({ ...formData, score1: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>{formData.clan2} Score</Label>
                        <Input
                          type="number"
                          value={formData.score2}
                          onChange={(e) => setFormData({ ...formData, score2: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}

                  {formData.status === 'completed' && (
                    <div>
                      <Label>Winner</Label>
                      <Select
                        value={formData.winner}
                        onValueChange={(value) => setFormData({ ...formData, winner: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select winner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={formData.clan1}>{formData.clan1}</SelectItem>
                          <SelectItem value={formData.clan2}>{formData.clan2}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    {editingMatch ? 'Update Match' : 'Create Match'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {matches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{match.sport_name}: {match.clan1} vs {match.clan2}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(match)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(match.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">Date: {match.date} at {match.time}</p>
                  <p className="text-sm text-foreground">Venue: {match.venue}</p>
                  <p className="text-sm text-foreground">Stage: {match.stage || 'league'}</p>
                  {match.group_name && <p className="text-sm text-foreground">Group: {match.group_name}</p>}
                  {match.category && <p className="text-sm text-foreground">Category: {match.category}</p>}
                  <p className="text-sm text-foreground">Status: {match.status}</p>
                  {match.score1 !== null && <p className="text-sm text-foreground">Score: {match.score1} - {match.score2}</p>}
                  {match.winner && <p className="text-sm text-foreground">Winner: {match.winner}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Update Match Scores</h2>
          
          <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Update Score: {scoringMatch?.clan1} vs {scoringMatch?.clan2}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{scoringMatch?.clan1} Score</Label>
                    <Input
                      type="number"
                      value={scoreData.score1}
                      onChange={(e) => setScoreData({ ...scoreData, score1: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>{scoringMatch?.clan2} Score</Label>
                    <Input
                      type="number"
                      value={scoreData.score2}
                      onChange={(e) => setScoreData({ ...scoreData, score2: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Match Status</Label>
                  <Select
                    value={scoreData.status}
                    onValueChange={(value: any) => setScoreData({ ...scoreData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scoreData.status === 'completed' && scoringMatch && (
                  <div>
                    <Label>Winner</Label>
                    <Select
                      value={scoreData.winner}
                      onValueChange={(value) => setScoreData({ ...scoreData, winner: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select winner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={scoringMatch.clan1}>
                          {scoringMatch.clan1}
                        </SelectItem>
                        <SelectItem value={scoringMatch.clan2}>
                          {scoringMatch.clan2}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleScoreUpdate} className="w-full">
                  Update Score
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4">
            {matches.filter(m => m.status !== 'completed').map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-foreground">{match.sport_name}</p>
                      <p className="text-sm font-normal text-muted-foreground">
                        {match.date} at {match.time}
                      </p>
                    </div>
                    <Button onClick={() => openScoreDialog(match)} size="sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Update Score
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="font-bold text-lg text-foreground">{match.clan1}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{match.score1 ?? '-'}</p>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground mx-4">VS</div>
                    <div className="text-center flex-1">
                      <p className="font-bold text-lg text-foreground">{match.clan2}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{match.score2 ?? '-'}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      match.status === 'live' ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}