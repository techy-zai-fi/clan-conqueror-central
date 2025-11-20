import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  urgent: boolean;
  created_at: string;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    urgent: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      toast.error('Error loading announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(formData)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast.success('Announcement updated successfully');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([formData]);

        if (error) throw error;
        toast.success('Announcement created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message || 'Error saving announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error('Error deleting announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      urgent: false,
    });
    setEditingAnnouncement(null);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      urgent: announcement.urgent,
    });
    setDialogOpen(true);
  };

  if (loading) return <p>Loading announcements...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Announcements</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
                />
                <Label htmlFor="urgent">Mark as Urgent</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className={announcement.urgent ? 'border-destructive' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{announcement.title}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(announcement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(announcement.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{announcement.message}</p>
              {announcement.urgent && <p className="text-sm text-destructive mt-2">⚠️ Urgent</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}