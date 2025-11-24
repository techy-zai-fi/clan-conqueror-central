import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface TeamEventResult {
  id: string;
  match_id: string;
  event_name: string;
  clan1_score: number;
  clan2_score: number;
  winner: string | null;
}

interface Match {
  id: string;
  sport_name: string;
  clan1: string;
  clan2: string;
  date: string;
  status: string;
}

export default function AdminTeamEvents() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [eventResults, setEventResults] = useState<TeamEventResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeamEventResult | null>(null);
  const [formData, setFormData] = useState({
    event_name: '',
    clan1_score: 0,
    clan2_score: 0,
    winner: '',
  });

  useEffect(() => {
    fetchTeamEventMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchEventResults();
    }
  }, [selectedMatch]);

  const fetchTeamEventMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, sport_name, clan1, clan2, date, status')
        .order('date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
      if (data && data.length > 0) {
        setSelectedMatch(data[0].id);
      }
    } catch (error: any) {
      toast.error('Error loading matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventResults = async () => {
    try {
      const { data, error } = await supabase
        .from('team_event_results')
        .select('*')
        .eq('match_id', selectedMatch)
        .order('event_name');

      if (error) throw error;
      setEventResults(data || []);
    } catch (error: any) {
      toast.error('Error loading event results');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        match_id: selectedMatch,
        ...formData,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('team_event_results')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event result updated');
      } else {
        const { error } = await supabase
          .from('team_event_results')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Event result added');
      }

      setDialogOpen(false);
      resetForm();
      fetchEventResults();
    } catch (error: any) {
      toast.error(error.message || 'Error saving event result');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event result?')) return;

    try {
      const { error } = await supabase
        .from('team_event_results')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event result deleted');
      fetchEventResults();
    } catch (error: any) {
      toast.error('Error deleting event result');
    }
  };

  const resetForm = () => {
    setFormData({
      event_name: '',
      clan1_score: 0,
      clan2_score: 0,
      winner: '',
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: TeamEventResult) => {
    setEditingEvent(event);
    setFormData({
      event_name: event.event_name,
      clan1_score: event.clan1_score,
      clan2_score: event.clan2_score,
      winner: event.winner || '',
    });
    setDialogOpen(true);
  };

  const selectedMatchData = matches.find(m => m.id === selectedMatch);

  if (loading) {
    return <div className="text-center text-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Team Event Results</h2>
      <p className="text-muted-foreground">
        Manage sub-event results for team sports like Badminton and Table Tennis
      </p>

      <div>
        <Label className="text-foreground mb-2 block">Select Match</Label>
        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {matches.map((match) => (
              <SelectItem key={match.id} value={match.id}>
                {match.sport_name}: {match.clan1} vs {match.clan2} - {match.date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMatchData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-foreground">
                {selectedMatchData.clan1} vs {selectedMatchData.clan2}
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event Result' : 'Add Event Result'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="event_name">Event Name</Label>
                      <Input
                        id="event_name"
                        value={formData.event_name}
                        onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                        placeholder="e.g., Men's Singles, Women's Doubles"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clan1_score">{selectedMatchData.clan1} Score</Label>
                      <Input
                        id="clan1_score"
                        type="number"
                        value={formData.clan1_score}
                        onChange={(e) => setFormData({ ...formData, clan1_score: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clan2_score">{selectedMatchData.clan2} Score</Label>
                      <Input
                        id="clan2_score"
                        type="number"
                        value={formData.clan2_score}
                        onChange={(e) => setFormData({ ...formData, clan2_score: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="winner">Winner (Optional)</Label>
                      <Select value={formData.winner} onValueChange={(value) => setFormData({ ...formData, winner: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select winner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value={selectedMatchData.clan1}>{selectedMatchData.clan1}</SelectItem>
                          <SelectItem value={selectedMatchData.clan2}>{selectedMatchData.clan2}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingEvent ? 'Update Event' : 'Add Event'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Event</TableHead>
                  <TableHead className="text-center text-foreground">{selectedMatchData.clan1}</TableHead>
                  <TableHead className="text-center text-foreground">{selectedMatchData.clan2}</TableHead>
                  <TableHead className="text-center text-foreground">Winner</TableHead>
                  <TableHead className="text-center text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No event results added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  eventResults.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-foreground">{event.event_name}</TableCell>
                      <TableCell className="text-center text-foreground">{event.clan1_score}</TableCell>
                      <TableCell className="text-center text-foreground">{event.clan2_score}</TableCell>
                      <TableCell className="text-center text-foreground">{event.winner || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
