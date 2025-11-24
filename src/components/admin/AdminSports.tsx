import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
  has_categories: boolean;
  is_team_event: boolean;
}

export default function AdminSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    has_categories: false,
    is_team_event: false,
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name');

      if (error) throw error;
      setSports(data || []);
    } catch (error: any) {
      toast.error('Error loading sports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSport) {
        const { error } = await supabase
          .from('sports')
          .update(formData)
          .eq('id', editingSport.id);

        if (error) throw error;
        toast.success('Sport updated successfully');
      } else {
        const { error } = await supabase
          .from('sports')
          .insert([formData]);

        if (error) throw error;
        toast.success('Sport created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchSports();
    } catch (error: any) {
      toast.error(error.message || 'Error saving sport');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sport?')) return;

    try {
      const { error } = await supabase
        .from('sports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Sport deleted successfully');
      fetchSports();
    } catch (error: any) {
      toast.error('Error deleting sport');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      description: '',
      has_categories: false,
      is_team_event: false,
    });
    setEditingSport(null);
  };

  const openEditDialog = (sport: Sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      icon: sport.icon,
      description: sport.description,
      has_categories: sport.has_categories,
      is_team_event: sport.is_team_event,
    });
    setDialogOpen(true);
  };

  if (loading) return <p>Loading sports...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Sports</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSport ? 'Edit Sport' : 'Add New Sport'}</DialogTitle>
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
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_categories"
                  checked={formData.has_categories}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_categories: checked as boolean })}
                />
                <Label htmlFor="has_categories" className="cursor-pointer">
                  Has Categories (Male/Female/Mixed)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_team_event"
                  checked={formData.is_team_event}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_team_event: checked as boolean })}
                />
                <Label htmlFor="is_team_event" className="cursor-pointer">
                  Is Team Event (Multiple sub-events like Badminton/TT)
                </Label>
              </div>
              <Button type="submit" className="w-full">
                {editingSport ? 'Update Sport' : 'Create Sport'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sports.map((sport) => (
          <Card key={sport.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{sport.icon} {sport.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(sport)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(sport.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{sport.description}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {sport.has_categories && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Has Categories</span>
                )}
                {sport.is_team_event && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Team Event</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}