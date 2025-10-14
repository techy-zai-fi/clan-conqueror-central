import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface Match {
  id: string;
  sport_name: string;
  clan1: string;
  clan2: string;
  date: string;
}

interface ClanMember {
  id: string;
  name: string;
  clan_id: string;
}

interface Clan {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  match_id: string;
  clan_id: string;
  member_id: string;
  member_name?: string;
}

export default function AdminTeamRosters() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedClan, setSelectedClan] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    fetchClans();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchTeamMembers(selectedMatch);
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('id, sport_name, clan1, clan2, date')
      .order('date', { ascending: false });
    setMatches(data || []);
  };

  const fetchClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('id, name');
    setClans(data || []);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('clan_members')
      .select('id, name, clan_id');
    setMembers(data || []);
  };

  const fetchTeamMembers = async (matchId: string) => {
    const { data } = await supabase
      .from('sport_team_members')
      .select('id, match_id, clan_id, member_id');
    
    if (data) {
      const enriched = data.map(tm => {
        const member = members.find(m => m.id === tm.member_id);
        return { ...tm, member_name: member?.name };
      });
      setTeamMembers(enriched.filter(tm => tm.match_id === matchId));
    }
  };

  const handleAddMembers = async () => {
    if (!selectedMatch || !selectedClan || selectedMembers.length === 0) {
      toast({ title: 'Please select match, clan, and members', variant: 'destructive' });
      return;
    }

    const insertData = selectedMembers.map(memberId => ({
      match_id: selectedMatch,
      clan_id: selectedClan,
      member_id: memberId,
    }));

    const { error } = await supabase
      .from('sport_team_members')
      .insert(insertData);

    if (error) {
      toast({ title: 'Error adding team members', variant: 'destructive' });
    } else {
      toast({ title: 'Team members added successfully' });
      fetchTeamMembers(selectedMatch);
      setSelectedMembers([]);
      setDialogOpen(false);
    }
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase
      .from('sport_team_members')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error removing member', variant: 'destructive' });
    } else {
      toast({ title: 'Member removed successfully' });
      fetchTeamMembers(selectedMatch);
    }
  };

  const getClanMembers = () => {
    if (!selectedClan) return [];
    return members.filter(m => m.clan_id === selectedClan);
  };

  const getMatchClans = () => {
    const match = matches.find(m => m.id === selectedMatch);
    if (!match) return [];
    return clans.filter(c => c.name === match.clan1 || c.name === match.clan2);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Team Rosters</h2>
      
      <div>
        <Label>Select Match</Label>
        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
          <SelectTrigger>
            <SelectValue placeholder="Select a match" />
          </SelectTrigger>
          <SelectContent>
            {matches.map((match) => (
              <SelectItem key={match.id} value={match.id}>
                {match.sport_name}: {match.clan1} vs {match.clan2} ({match.date})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMatch && (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team Members
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Clan</Label>
                  <Select value={selectedClan} onValueChange={setSelectedClan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clan" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMatchClans().map((clan) => (
                        <SelectItem key={clan.id} value={clan.id}>
                          {clan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClan && (
                  <div className="space-y-2">
                    <Label>Select Members</Label>
                    {getClanMembers().map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            }
                          }}
                        />
                        <label className="text-sm">{member.name}</label>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleAddMembers} className="w-full">
                  Add Selected Members
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 md:grid-cols-2">
            {getMatchClans().map((clan) => {
              const clanTeam = teamMembers.filter(tm => tm.clan_id === clan.id);
              return (
                <Card key={clan.id}>
                  <CardHeader>
                    <CardTitle>{clan.name} Roster</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clanTeam.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members added</p>
                    ) : (
                      <ul className="space-y-2">
                        {clanTeam.map((tm) => (
                          <li key={tm.id} className="flex justify-between items-center">
                            <span>{tm.member_name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(tm.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
