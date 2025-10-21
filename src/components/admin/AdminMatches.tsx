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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CalendarIcon } from 'lucide-react';
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
}

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
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

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Matches</h2>
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
                <Label htmlFor="sport">Sport</Label>
                <Select
                  value={formData.sport_id}
                  onValueChange={(value) => {
                    const sport = sports.find(s => s.id === value);
                    setFormData({ ...formData, sport_id: value, sport_name: sport?.name || '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.icon} {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clan1">Clan 1</Label>
                <Select
                  value={formData.clan1}
                  onValueChange={(value) => setFormData({ ...formData, clan1: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clan 1" />
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
                <Label htmlFor="clan2">Clan 2</Label>
                <Select
                  value={formData.clan2}
                  onValueChange={(value) => setFormData({ ...formData, clan2: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clan 2" />
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
                <Label htmlFor="date">Date</Label>
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setFormData({ ...formData, date: format(date, "PPP") });
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
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
                <>
                  <div>
                    <Label htmlFor="score1">Score Clan 1</Label>
                    <Input
                      id="score1"
                      type="number"
                      value={formData.score1}
                      onChange={(e) => setFormData({ ...formData, score1: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="score2">Score Clan 2</Label>
                    <Input
                      id="score2"
                      type="number"
                      value={formData.score2}
                      onChange={(e) => setFormData({ ...formData, score2: parseInt(e.target.value) })}
                    />
                  </div>
                </>
              )}
              {formData.status === 'completed' && (
                <div>
                  <Label htmlFor="winner">Winner</Label>
                  <Input
                    id="winner"
                    value={formData.winner}
                    onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                  />
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
              <p className="text-sm">Date: {match.date} at {match.time}</p>
              <p className="text-sm">Venue: {match.venue}</p>
              <p className="text-sm">Status: {match.status}</p>
              {match.score1 !== null && <p className="text-sm">Score: {match.score1} - {match.score2}</p>}
              {match.winner && <p className="text-sm">Winner: {match.winner}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}