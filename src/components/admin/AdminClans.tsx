import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';

interface Clan {
  id: string;
  clan_code: string | null;
  name: string;
  tagline: string;
  color: string;
  sub_color: string | null;
  logo: string;
  mascot: string;
  bg_image: string | null;
  video_url: string | null;
  display_order: number | null;
  total_points: number;
  rank: number | null;
}

export default function AdminClans() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClan, setEditingClan] = useState<Clan | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [formData, setFormData] = useState({
    clan_code: '',
    name: '',
    tagline: '',
    color: '#000000',
    sub_color: '#000000',
    logo: '',
    mascot: '',
    bg_image: '',
    video_url: '',
    display_order: 1,
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clan-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('clan-logos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo: publicUrl });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB for backgrounds)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingBg(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `bg-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clan-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('clan-logos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, bg_image: publicUrl });
      toast.success('Background uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading background');
    } finally {
      setUploadingBg(false);
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
      clan_code: '',
      name: '',
      tagline: '',
      color: '#000000',
      sub_color: '#000000',
      logo: '',
      mascot: '',
      bg_image: '',
      video_url: '',
      display_order: 1,
      total_points: 0,
      rank: 1,
    });
    setEditingClan(null);
  };

  const openEditDialog = (clan: Clan) => {
    setEditingClan(clan);
    setFormData({
      clan_code: clan.clan_code || '',
      name: clan.name,
      tagline: clan.tagline,
      color: clan.color,
      sub_color: clan.sub_color || '#000000',
      logo: clan.logo,
      mascot: clan.mascot,
      bg_image: clan.bg_image || '',
      video_url: clan.video_url || '',
      display_order: clan.display_order || 1,
      total_points: clan.total_points,
      rank: clan.rank || 1,
    });
    setDialogOpen(true);
  };

  if (loading) return <p>Loading clans...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Clans</h2>
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
                <Label htmlFor="clan_code">Clan Code (2 characters)</Label>
                <Input
                  id="clan_code"
                  value={formData.clan_code}
                  onChange={(e) => setFormData({ ...formData, clan_code: e.target.value.toUpperCase() })}
                  maxLength={2}
                  required
                  placeholder="RD"
                />
              </div>
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
                <Label htmlFor="logo">Logo</Label>
                <div className="space-y-2">
                  {formData.logo && (
                    <div className="flex items-center gap-2">
                      {formData.logo.startsWith('http') ? (
                        <img src={formData.logo} alt="Logo preview" className="h-12 w-12 object-contain" />
                      ) : (
                        <span className="text-2xl text-foreground">{formData.logo}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="logo"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="Emoji or text"
                    />
                    <Label htmlFor="logo-file" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploadingLogo} asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingLogo ? 'Uploading...' : 'Upload'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="logo-file"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
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
                <Label htmlFor="sub_color">Sub Color (hex)</Label>
                <Input
                  id="sub_color"
                  type="color"
                  value={formData.sub_color}
                  onChange={(e) => setFormData({ ...formData, sub_color: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bg_image">Background Image</Label>
                <div className="space-y-2">
                  {formData.bg_image && (
                    <img src={formData.bg_image} alt="Background preview" className="h-24 w-full object-cover rounded" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="bg_image"
                      value={formData.bg_image}
                      onChange={(e) => setFormData({ ...formData, bg_image: e.target.value })}
                      placeholder="URL or upload"
                    />
                    <Label htmlFor="bg-file" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploadingBg} asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingBg ? 'Uploading...' : 'Upload'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="bg-file"
                      type="file"
                      accept="image/*"
                      onChange={handleBgUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="video_url">Intro Video URL (YouTube embed)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use the embed URL format from YouTube
                </p>
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
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
                <span className="flex items-center gap-2">
                  {clan.logo.startsWith('http') ? (
                    <img src={clan.logo} alt={clan.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <span>{clan.logo}</span>
                  )}
                  {clan.name}
                </span>
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
              <p className="text-sm text-foreground mt-2">Mascot: {clan.mascot}</p>
              <p className="text-sm text-foreground">Points: {clan.total_points}</p>
              <p className="text-sm text-foreground">Rank: {clan.rank}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}