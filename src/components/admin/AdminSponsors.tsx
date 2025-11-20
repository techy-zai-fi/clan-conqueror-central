import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ExternalLink, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Sponsor {
  id: string;
  name: string;
  image_url: string;
  website_url: string | null;
  display_order: number;
}

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    website_url: '',
    display_order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch sponsors',
        variant: 'destructive',
      });
    } else {
      setSponsors(data || []);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
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

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSponsor) {
      const { error } = await supabase
        .from('sponsors')
        .update(formData)
        .eq('id', editingSponsor.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update sponsor',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Sponsor updated successfully',
        });
        fetchSponsors();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('sponsors').insert([formData]);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add sponsor',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Sponsor added successfully',
        });
        fetchSponsors();
        resetForm();
      }
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      image_url: sponsor.image_url,
      website_url: sponsor.website_url || '',
      display_order: sponsor.display_order,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sponsors').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete sponsor',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Sponsor deleted successfully',
      });
      fetchSponsors();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image_url: '',
      website_url: '',
      display_order: 0,
    });
    setEditingSponsor(null);
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Sponsors</CardTitle>
            <CardDescription>Add and manage championship sponsors</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Sponsor Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Sponsor Logo</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-20 w-20 object-contain border rounded"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website_url">Website URL (Optional)</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSponsor ? 'Update' : 'Add'} Sponsor
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={sponsor.image_url}
                    alt={sponsor.name}
                    className="h-24 w-24 object-contain"
                  />
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground">{sponsor.name}</h3>
                    <p className="text-sm text-muted-foreground">Order: {sponsor.display_order}</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    {sponsor.website_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(sponsor.website_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(sponsor)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(sponsor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
