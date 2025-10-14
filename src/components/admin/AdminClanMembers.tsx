import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClanMember {
  id: string;
  clan_id: string;
  name: string;
  profile_image: string | null;
}

interface Clan {
  id: string;
  name: string;
}

export default function AdminClanMembers() {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ClanMember | null>(null);
  const [formData, setFormData] = useState({
    clan_id: '',
    name: '',
    profile_image: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchClans();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('clan_members')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'Error fetching members', variant: 'destructive' });
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const fetchClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('id, name')
      .order('name');
    
    setClans(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      const { error } = await supabase
        .from('clan_members')
        .update(formData)
        .eq('id', editingMember.id);
      
      if (error) {
        toast({ title: 'Error updating member', variant: 'destructive' });
      } else {
        toast({ title: 'Member updated successfully' });
        fetchMembers();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('clan_members')
        .insert([formData]);
      
      if (error) {
        toast({ title: 'Error adding member', variant: 'destructive' });
      } else {
        toast({ title: 'Member added successfully' });
        fetchMembers();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({ title: 'Error deleting member', variant: 'destructive' });
      } else {
        toast({ title: 'Member deleted successfully' });
        fetchMembers();
      }
    }
  };

  const resetForm = () => {
    setFormData({ clan_id: '', name: '', profile_image: '' });
    setEditingMember(null);
    setDialogOpen(false);
  };

  const openEditDialog = (member: ClanMember) => {
    setEditingMember(member);
    setFormData({
      clan_id: member.clan_id,
      name: member.name,
      profile_image: member.profile_image || '',
    });
    setDialogOpen(true);
  };

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clan Members</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Clan</Label>
                <Select value={formData.clan_id} onValueChange={(value) => setFormData({ ...formData, clan_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clan" />
                  </SelectTrigger>
                  <SelectContent>
                    {clans.map((clan) => (
                      <SelectItem key={clan.id} value={clan.id}>
                        {clan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Profile Image URL</Label>
                <Input
                  value={formData.profile_image}
                  onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full">
                {editingMember ? 'Update' : 'Add'} Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const clan = clans.find((c) => c.id === member.clan_id);
          return (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{member.name}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.profile_image && (
                  <img src={member.profile_image} alt={member.name} className="w-20 h-20 rounded-full mb-2 object-cover" />
                )}
                <p className="text-sm text-muted-foreground">Clan: {clan?.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
