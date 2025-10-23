import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Link as LinkIcon, Save } from 'lucide-react';

interface SiteSettings {
  id: string;
  logo_url: string | null;
  site_name: string;
  site_subtitle: string | null;
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: '',
    site_name: '',
    site_subtitle: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      
      setSettings(data);
      setFormData({
        logo_url: data.logo_url || '',
        site_name: data.site_name || '',
        site_subtitle: data.site_subtitle || '',
      });
    } catch (error: any) {
      toast.error('Error loading site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clan-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('clan-logos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (settings) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            logo_url: formData.logo_url || null,
            site_name: formData.site_name,
            site_subtitle: formData.site_subtitle || null,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            logo_url: formData.logo_url || null,
            site_name: formData.site_name,
            site_subtitle: formData.site_subtitle || null,
          }]);

        if (error) throw error;
      }

      toast.success('Site settings updated successfully');
      fetchSettings();
      
      // Trigger a page reload to update navbar
      window.location.reload();
    } catch (error: any) {
      toast.error('Error saving site settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage navbar logo and text</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Site Logo</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Image URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {formData.logo_url && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img src={formData.logo_url} alt="Logo preview" className="h-16 w-16 object-contain" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
                {formData.logo_url && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img src={formData.logo_url} alt="Logo preview" className="h-16 w-16 object-contain" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="Clash of Clans"
              required
            />
          </div>

          <div>
            <Label htmlFor="site_subtitle">Site Subtitle</Label>
            <Input
              id="site_subtitle"
              value={formData.site_subtitle}
              onChange={(e) => setFormData({ ...formData, site_subtitle: e.target.value })}
              placeholder="IIM Bodh Gaya 2025"
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
