import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Clan {
  id: string;
  name: string;
  tagline: string;
  color: string;
  logo: string;
  mascot: string;
  total_points: number;
  rank: number | null;
}

export default function AdminClans() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClan, setEditingClan] = useState<Clan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    color: '#000000',
    logo: '',
    mascot: '',
    total_points: 0,
    rank: 1,
  });

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchClans = async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .order('rank', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setClans(data || []);
    } catch (error: any) {
      toast.error('Error loading clans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClan) {
        const { error } = await supabase
          .from('clans')
          .update(formData)
          .eq('id', editingClan.id);

        if (error) throw error;
        toast.success('Clan updated successfully');
      } else {
        const { error } = await supabase
          .from('clans')
          .insert([formData]);

        if (error) throw error;
        toast.success('Clan created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchClans();
    } catch (error: any) {
      toast.error(error.message || 'Error saving clan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this clan?')) return;

    try {
      const { error } = await supabase
        .from('clans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Clan deleted successfully');
      fetchClans();
    } catch (error: any) {
      toast.error('Error deleting clan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tagline: '',
      color: '#000000',
      logo: '',
      mascot: '',
      total_points: 0,
      rank: 1,
    });
    setEditingClan(null);
  };

  const openEditDialog = (clan: Clan) => {
    setEditingClan(clan);
    setFormData({
      name: clan.name,
      tagline: clan.tagline,
      color: clan.color,
      logo: clan.logo,
      mascot: clan.mascot,
      total_points: clan.total_points,
      rank: clan.rank || 1,
    });
    setDialogOpen(true);
  };

  if (loading) return <p>Loading clans...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Clans</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Clan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClan ? 'Edit Clan' : 'Add New Clan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color (hex)</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo (emoji or text)</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mascot">Mascot</Label>
                <Input
                  id="mascot"
                  value={formData.mascot}
                  onChange={(e) => setFormData({ ...formData, mascot: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_points">Total Points</Label>
                <Input
                  id="total_points"
                  type="number"
                  value={formData.total_points}
                  onChange={(e) => setFormData({ ...formData, total_points: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rank">Rank</Label>
                <Input
                  id="rank"
                  type="number"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingClan ? 'Update Clan' : 'Create Clan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clans.map((clan) => (
          <Card key={clan.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{clan.logo} {clan.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(clan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(clan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{clan.tagline}</p>
              <p className="text-sm mt-2">Mascot: {clan.mascot}</p>
              <p className="text-sm">Points: {clan.total_points}</p>
              <p className="text-sm">Rank: {clan.rank}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}