import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Highlight {
  id: string;
  date: string;
  description: string;
  image_url: string | null;
}

export default function AdminHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (error: any) {
      toast.error('Error loading highlights');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const highlightData = {
        date: formData.date,
        description: formData.description,
        image_url: formData.image_url || null,
      };

      if (editingHighlight) {
        const { error } = await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', editingHighlight.id);

        if (error) throw error;
        toast.success('Highlight updated successfully');
      } else {
        const { error } = await supabase
          .from('highlights')
          .insert([highlightData]);

        if (error) throw error;
        toast.success('Highlight created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchHighlights();
    } catch (error: any) {
      toast.error(error.message || 'Error saving highlight');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this highlight?')) return;

    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Highlight deleted successfully');
      fetchHighlights();
    } catch (error: any) {
      toast.error('Error deleting highlight');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      description: '',
      image_url: '',
    });
    setEditingHighlight(null);
  };

  const openEditDialog = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setFormData({
      date: highlight.date,
      description: highlight.description,
      image_url: highlight.image_url || '',
    });
    setDialogOpen(true);
  };

  if (loading) return <p>Loading highlights...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Highlights</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHighlight ? 'Edit Highlight' : 'Add New Highlight'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g., Feb 1, 2025"
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
              <div>
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full">
                {editingHighlight ? 'Update Highlight' : 'Create Highlight'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {highlights.map((highlight) => (
          <Card key={highlight.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{highlight.date}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(highlight)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(highlight.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{highlight.description}</p>
              {highlight.image_url && (
                <img src={highlight.image_url} alt="Highlight" className="mt-2 rounded-lg max-w-full h-auto" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}