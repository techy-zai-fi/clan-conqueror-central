import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface FooterSettings {
  id?: string;
  company_name: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  copyright_text: string;
  show_social_links: boolean;
  show_newsletter: boolean;
}

export default function AdminFooterSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<FooterSettings>({
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
    copyright_text: '© {year} IT Committee IIM Bodh Gaya. All rights reserved.',
    show_social_links: true,
    show_newsletter: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('footer_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching footer settings:', error);
      return;
    }

    if (data) {
      setSettings(data);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('footer_settings')
          .update(settings)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('footer_settings')
          .insert([settings]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Footer settings saved successfully',
      });
      
      fetchSettings();
    } catch (error) {
      console.error('Error saving footer settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save footer settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="about_text">About Text</Label>
            <Textarea
              id="about_text"
              value={settings.about_text}
              onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="copyright_text">Copyright Text (use {'{year}'} for current year)</Label>
            <Input
              id="copyright_text"
              value={settings.copyright_text}
              onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input
              id="facebook_url"
              value={settings.facebook_url}
              onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="twitter_url">Twitter URL</Label>
            <Input
              id="twitter_url"
              value={settings.twitter_url}
              onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              value={settings.instagram_url}
              onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={settings.linkedin_url}
              onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <Input
              id="youtube_url"
              value={settings.youtube_url}
              onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show_social_links">Show Social Media Links</Label>
            <Switch
              id="show_social_links"
              checked={settings.show_social_links}
              onCheckedChange={(checked) => setSettings({ ...settings, show_social_links: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show_newsletter">Show Newsletter Subscription</Label>
            <Switch
              id="show_newsletter"
              checked={settings.show_newsletter}
              onCheckedChange={(checked) => setSettings({ ...settings, show_newsletter: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        {loading ? 'Saving...' : 'Save Footer Settings'}
      </Button>
    </div>
  );
}
