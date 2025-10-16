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
  email: string | null;
  reg_num: string | null;
  gender: string | null;
  batch: string | null;
  year: number | null;
}

interface Clan {
  id: string;
  name: string;
  clan_code: string | null;
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
    email: '',
    reg_num: '',
    gender: '',
    batch: '',
    year: null as number | null,
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
      .select('id, name, clan_code')
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
    setFormData({ 
      clan_id: '', 
      name: '', 
      profile_image: '',
      email: '',
      reg_num: '',
      gender: '',
      batch: '',
      year: null,
    });
    setEditingMember(null);
    setDialogOpen(false);
  };

  const openEditDialog = (member: ClanMember) => {
    setEditingMember(member);
    setFormData({
      clan_id: member.clan_id,
      name: member.name,
      profile_image: member.profile_image || '',
      email: member.email || '',
      reg_num: member.reg_num || '',
      gender: member.gender || '',
      batch: member.batch || '',
      year: member.year || null,
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
                      <SelectItem key={clan.id} value={clan.clan_code || clan.id}>
                        {clan.name} ({clan.clan_code || clan.id})
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
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <Label>Registration Number</Label>
                <Input
                  value={formData.reg_num}
                  onChange={(e) => setFormData({ ...formData, reg_num: e.target.value })}
                  placeholder="DBM/1001/03"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch</Label>
                <Input
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="DBM, HHM, etc."
                />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="3"
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
          const clan = clans.find((c) => c.clan_code === member.clan_id || c.id === member.clan_id);
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
                {member.reg_num && <p className="text-xs text-muted-foreground">Reg: {member.reg_num}</p>}
                {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                {member.batch && member.year && <p className="text-xs text-muted-foreground">{member.batch} - Year {member.year}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
