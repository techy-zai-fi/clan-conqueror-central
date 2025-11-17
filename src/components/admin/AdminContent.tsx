import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  urgent: boolean;
  created_at: string;
}

interface Highlight {
  id: string;
  date: string;
  description: string;
  image_url: string | null;
}

export default function AdminContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<'announcement' | 'highlight'>('announcement');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    urgent: false,
  });

  const [highlightForm, setHighlightForm] = useState({
    date: '',
    description: '',
    image_url: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsRes, highlightsRes] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('highlights').select('*').order('created_at', { ascending: false }),
      ]);

      if (announcementsRes.error) throw announcementsRes.error;
      if (highlightsRes.error) throw highlightsRes.error;

      setAnnouncements(announcementsRes.data || []);
      setHighlights(highlightsRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementSubmit = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementForm)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Announcement updated' });
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([announcementForm]);
        if (error) throw error;
        toast({ title: 'Announcement created' });
      }
      resetForms();
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleHighlightSubmit = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('highlights')
          .update(highlightForm)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Highlight updated' });
      } else {
        const { error } = await supabase
          .from('highlights')
          .insert([highlightForm]);
        if (error) throw error;
        toast({ title: 'Highlight created' });
      }
      resetForms();
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, table: 'announcements' | 'highlights') => {
    if (!confirm(`Are you sure you want to delete this ${table === 'announcements' ? 'announcement' : 'highlight'}?`)) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForms = () => {
    setAnnouncementForm({ title: '', message: '', urgent: false });
    setHighlightForm({ date: '', description: '', image_url: '' });
    setEditingId(null);
  };

  const openEditDialog = (type: 'announcement' | 'highlight', item: any) => {
    setContentType(type);
    setEditingId(item.id);
    if (type === 'announcement') {
      setAnnouncementForm({
        title: item.title,
        message: item.message,
        urgent: item.urgent,
      });
    } else {
      setHighlightForm({
        date: item.date,
        description: item.description,
        image_url: item.image_url || '',
      });
    }
    setDialogOpen(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="highlights">Highlights</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <Dialog open={dialogOpen && contentType === 'announcement'} onOpenChange={(open) => {
            if (contentType === 'announcement') {
              setDialogOpen(open);
              if (!open) resetForms();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setContentType('announcement')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Announcement' : 'Add Announcement'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                />
                <Textarea
                  placeholder="Message"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={announcementForm.urgent}
                    onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, urgent: checked })}
                  />
                  <Label>Urgent</Label>
                </div>
                <Button onClick={handleAnnouncementSubmit} className="w-full">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 mt-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={announcement.urgent ? 'border-destructive' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{announcement.title}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog('announcement', announcement)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement.id, 'announcements')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{announcement.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="highlights">
          <Dialog open={dialogOpen && contentType === 'highlight'} onOpenChange={(open) => {
            if (contentType === 'highlight') {
              setDialogOpen(open);
              if (!open) resetForms();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setContentType('highlight')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Highlight
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Highlight' : 'Add Highlight'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Date"
                  value={highlightForm.date}
                  onChange={(e) => setHighlightForm({ ...highlightForm, date: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={highlightForm.description}
                  onChange={(e) => setHighlightForm({ ...highlightForm, description: e.target.value })}
                />
                <Input
                  placeholder="Image URL (optional)"
                  value={highlightForm.image_url}
                  onChange={(e) => setHighlightForm({ ...highlightForm, image_url: e.target.value })}
                />
                {highlightForm.image_url && (
                  <img src={highlightForm.image_url} alt="Preview" className="w-full h-32 object-cover rounded" />
                )}
                <Button onClick={handleHighlightSubmit} className="w-full">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 mt-4">
            {highlights.map((highlight) => (
              <Card key={highlight.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{highlight.date}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog('highlight', highlight)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(highlight.id, 'highlights')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {highlight.image_url && (
                    <img src={highlight.image_url} alt={highlight.description} className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <p>{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
