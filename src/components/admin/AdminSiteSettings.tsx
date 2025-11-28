import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Upload, Link as LinkIcon, Save } from 'lucide-react';

interface SiteSettings {
  id: string;
  logo_url: string | null;
  hero_logo_url: string | null;
  itcom_logo_url: string | null;
  site_name: string;
  site_subtitle: string | null;
  active_leaderboard_type: string;
}

interface FooterSettings {
  id: string;
  company_name: string;
  about_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  copyright_text: string | null;
  show_social_links: boolean;
  show_newsletter: boolean;
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: '',
    hero_logo_url: '',
    itcom_logo_url: '',
    site_name: '',
    site_subtitle: '',
    active_leaderboard_type: 'playoff',
  });
  const [footerFormData, setFooterFormData] = useState({
    company_name: 'IT Committee IIM Bodh Gaya',
    about_text: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    copyright_text: '',
    show_social_links: true,
    show_newsletter: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchFooterSettings();
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
        hero_logo_url: data.hero_logo_url || '',
        itcom_logo_url: data.itcom_logo_url || '',
        site_name: data.site_name || '',
        site_subtitle: data.site_subtitle || '',
        active_leaderboard_type: data.active_leaderboard_type || 'playoff',
      });
    } catch (error: any) {
      toast.error('Error loading site settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchFooterSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setFooterSettings(data);
        setFooterFormData({
          company_name: data.company_name || 'IT Committee IIM Bodh Gaya',
          about_text: data.about_text || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          address: data.address || '',
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          instagram_url: data.instagram_url || '',
          linkedin_url: data.linkedin_url || '',
          youtube_url: data.youtube_url || '',
          copyright_text: data.copyright_text || '',
          show_social_links: data.show_social_links ?? true,
          show_newsletter: data.show_newsletter ?? true,
        });
      }
    } catch (error: any) {
      toast.error('Error loading footer settings');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'hero_logo_url' | 'itcom_logo_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clan-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('clan-logos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, [field]: publicUrl });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSiteSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (settings) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            logo_url: formData.logo_url || null,
            hero_logo_url: formData.hero_logo_url || null,
            itcom_logo_url: formData.itcom_logo_url || null,
            site_name: formData.site_name,
            site_subtitle: formData.site_subtitle || null,
            active_leaderboard_type: formData.active_leaderboard_type,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            logo_url: formData.logo_url || null,
            hero_logo_url: formData.hero_logo_url || null,
            itcom_logo_url: formData.itcom_logo_url || null,
            site_name: formData.site_name,
            site_subtitle: formData.site_subtitle || null,
            active_leaderboard_type: formData.active_leaderboard_type,
          }]);

        if (error) throw error;
      }

      toast.success('Site settings updated successfully');
      fetchSettings();
      
      window.location.reload();
    } catch (error: any) {
      toast.error('Error saving site settings');
    }
  };

  const handleFooterSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (footerSettings) {
        const { error } = await supabase
          .from('footer_settings')
          .update({
            ...footerFormData,
          })
          .eq('id', footerSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_settings')
          .insert([{
            ...footerFormData,
          }]);

        if (error) throw error;
      }

      toast.success('Footer settings updated successfully');
      fetchFooterSettings();
      window.location.reload();
    } catch (error: any) {
      toast.error('Error saving footer settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs defaultValue="site" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="site">Site Settings</TabsTrigger>
        <TabsTrigger value="footer">Footer Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="site">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>Manage navbar logo, hero logo, and text</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>Navbar Logo</Label>
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
                        onChange={(e) => handleLogoUpload(e, 'logo_url')}
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.logo_url && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img src={formData.logo_url} alt="Navbar logo preview" className="h-16 w-16 object-contain" />
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
                        <img src={formData.logo_url} alt="Navbar logo preview" className="h-16 w-16 object-contain" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4">
                <Label>Hero Section Logo</Label>
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
                        onChange={(e) => handleLogoUpload(e, 'hero_logo_url')}
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.hero_logo_url && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img src={formData.hero_logo_url} alt="Hero logo preview" className="h-16 w-16 object-contain rounded-lg" />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <Input
                      type="url"
                      placeholder="https://example.com/hero-logo.png"
                      value={formData.hero_logo_url}
                      onChange={(e) => setFormData({ ...formData, hero_logo_url: e.target.value })}
                    />
                    {formData.hero_logo_url && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img src={formData.hero_logo_url} alt="Hero logo preview" className="h-16 w-16 object-contain rounded-lg" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4">
                <Label>ITCOM Logo (Shown with "By ITCOM" text)</Label>
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
                        onChange={(e) => handleLogoUpload(e, 'itcom_logo_url')}
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.itcom_logo_url && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img src={formData.itcom_logo_url} alt="ITCOM logo preview" className="h-12 w-12 object-contain" />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <Input
                      type="url"
                      placeholder="https://example.com/itcom-logo.png"
                      value={formData.itcom_logo_url}
                      onChange={(e) => setFormData({ ...formData, itcom_logo_url: e.target.value })}
                    />
                    {formData.itcom_logo_url && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img src={formData.itcom_logo_url} alt="ITCOM logo preview" className="h-12 w-12 object-contain" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_subtitle">Site Subtitle</Label>
                <Input
                  id="site_subtitle"
                  value={formData.site_subtitle}
                  onChange={(e) => setFormData({ ...formData, site_subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>Home Page Leaderboard Type</Label>
                <RadioGroup
                  value={formData.active_leaderboard_type}
                  onValueChange={(value) => setFormData({ ...formData, active_leaderboard_type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="playoff" id="playoff" />
                    <Label htmlFor="playoff" className="font-normal cursor-pointer">
                      Playoff Leaderboard (Overall medals & points from all sports)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="league" id="league" />
                    <Label htmlFor="league" className="font-normal cursor-pointer">
                      League Leaderboard (League stage standings)
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Choose which leaderboard to display on the home page
                </p>
              </div>

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Site Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="footer">
        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
            <CardDescription>Manage footer content, contact info, and social links</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFooterSettingsSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={footerFormData.company_name}
                  onChange={(e) => setFooterFormData({ ...footerFormData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about_text">About Text</Label>
                <Textarea
                  id="about_text"
                  value={footerFormData.about_text}
                  onChange={(e) => setFooterFormData({ ...footerFormData, about_text: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={footerFormData.contact_email}
                    onChange={(e) => setFooterFormData({ ...footerFormData, contact_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={footerFormData.contact_phone}
                    onChange={(e) => setFooterFormData({ ...footerFormData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={footerFormData.address}
                  onChange={(e) => setFooterFormData({ ...footerFormData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      type="url"
                      value={footerFormData.facebook_url}
                      onChange={(e) => setFooterFormData({ ...footerFormData, facebook_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">Twitter URL</Label>
                    <Input
                      id="twitter_url"
                      type="url"
                      value={footerFormData.twitter_url}
                      onChange={(e) => setFooterFormData({ ...footerFormData, twitter_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      type="url"
                      value={footerFormData.instagram_url}
                      onChange={(e) => setFooterFormData({ ...footerFormData, instagram_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={footerFormData.linkedin_url}
                      onChange={(e) => setFooterFormData({ ...footerFormData, linkedin_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_url">YouTube URL</Label>
                    <Input
                      id="youtube_url"
                      type="url"
                      value={footerFormData.youtube_url}
                      onChange={(e) => setFooterFormData({ ...footerFormData, youtube_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyright_text">Copyright Text (use {'{year}'} for current year)</Label>
                <Input
                  id="copyright_text"
                  value={footerFormData.copyright_text}
                  onChange={(e) => setFooterFormData({ ...footerFormData, copyright_text: e.target.value })}
                  placeholder="© {year} Company Name. All rights reserved."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="show_social_links"
                    checked={footerFormData.show_social_links}
                    onCheckedChange={(checked) => setFooterFormData({ ...footerFormData, show_social_links: checked })}
                  />
                  <Label htmlFor="show_social_links">Show Social Links</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="show_newsletter"
                    checked={footerFormData.show_newsletter}
                    onCheckedChange={(checked) => setFooterFormData({ ...footerFormData, show_newsletter: checked })}
                  />
                  <Label htmlFor="show_newsletter">Show Newsletter</Label>
                </div>
              </div>

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Footer Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
