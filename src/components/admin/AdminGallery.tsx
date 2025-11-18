import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
  created_at: string;
}

interface BulkImageData {
  title: string;
  description: string;
  image_url: string;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 0,
  });
  const [bulkImages, setBulkImages] = useState<BulkImageData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedImages: BulkImageData[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `gallery-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('clan-logos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('clan-logos')
          .getPublicUrl(fileName);

        uploadedImages.push({
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          image_url: publicUrl,
        });
      }

      setBulkImages(uploadedImages);
      toast({ title: `${files.length} images uploaded successfully` });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBulkSubmit = async () => {
    try {
      const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : 0;
      
      const imagesToInsert = bulkImages.map((img, index) => ({
        title: img.title,
        description: img.description || null,
        image_url: img.image_url,
        display_order: maxOrder + index + 1,
      }));

      const { error } = await supabase
        .from('gallery')
        .insert(imagesToInsert);

      if (error) throw error;
      
      toast({ title: `${bulkImages.length} images added successfully` });
      setBulkImages([]);
      setBulkDialogOpen(false);
      fetchImages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingImage) {
        const { error } = await supabase
          .from('gallery')
          .update(formData)
          .eq('id', editingImage.id);

        if (error) throw error;
        toast({ title: 'Image updated successfully' });
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Image added successfully' });
      }

      resetForm();
      setDialogOpen(false);
      fetchImages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Image deleted successfully' });
      fetchImages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      display_order: 0,
    });
    setEditingImage(null);
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      description: image.description || '',
      image_url: image.image_url,
      display_order: image.display_order,
    });
    setDialogOpen(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={bulkDialogOpen} onOpenChange={(open) => {
          setBulkDialogOpen(open);
          if (!open) setBulkImages([]);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Upload Gallery Images</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>}
              </div>

              {bulkImages.length > 0 && (
                <>
                  <div className="space-y-4">
                    {bulkImages.map((img, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <img src={img.image_url} alt={img.title} className="w-full h-48 object-cover rounded" />
                            </div>
                            <div className="space-y-2">
                              <Input
                                placeholder="Image title"
                                value={img.title}
                                onChange={(e) => {
                                  const updated = [...bulkImages];
                                  updated[index].title = e.target.value;
                                  setBulkImages(updated);
                                }}
                              />
                              <Textarea
                                placeholder="Description (optional)"
                                value={img.description}
                                onChange={(e) => {
                                  const updated = [...bulkImages];
                                  updated[index].description = e.target.value;
                                  setBulkImages(updated);
                                }}
                                rows={3}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button onClick={handleBulkSubmit} className="w-full">
                    Add All {bulkImages.length} Images to Gallery
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Single Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingImage ? 'Edit Image' : 'Add Image'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Display Order"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded" />
              )}
              <Button onClick={handleSubmit} className="w-full">
                {editingImage ? 'Update' : 'Add'} Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Images</h3>
          <p className="text-muted-foreground">Add images to the gallery to get started</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate">{image.title}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(image)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {image.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
