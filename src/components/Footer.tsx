import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FooterSettings {
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

const Footer = () => {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [itcomLogoUrl, setItcomLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchFooterSettings();
    fetchSiteSettings();
  }, []);

  const fetchFooterSettings = async () => {
    const { data } = await supabase
      .from('footer_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (data) setSettings(data);
  };

  const fetchSiteSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('itcom_logo_url')
      .limit(1)
      .maybeSingle();
    
    if (data) setItcomLogoUrl(data.itcom_logo_url);
  };

  const currentYear = new Date().getFullYear();
  const defaultSettings: FooterSettings = {
    company_name: 'IT Committee IIM Bodh Gaya',
    about_text: 'Leading the digital transformation at IIM Bodh Gaya through innovation and technology.',
    contact_email: 'sportscomm@iimbg.ac.in',
    contact_phone: '+91 6203 749062',
    address: 'IIM Bodh Gaya, Uruvela, Bodh Gaya, Bihar 824234',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: 'https://www.linkedin.com/company/it-committee-iim-bodh-gaya/',
    youtube_url: '',
    copyright_text: '© {year} IT Committee IIM Bodh Gaya. All rights reserved.',
    show_social_links: true,
    show_newsletter: false,
  };
  
  const footerSettings = settings || defaultSettings;
  const copyrightText = footerSettings.copyright_text?.replace('{year}', currentYear.toString()) || 
    `© ${currentYear} ${footerSettings.company_name}. All rights reserved.`;

  return (
    <footer className="w-full bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            {itcomLogoUrl && (
              <img 
                src={itcomLogoUrl} 
                alt="ITCOM Logo" 
                className="h-16 w-auto object-contain mb-2"
              />
            )}
            <h3 className="text-lg font-bold text-foreground">{footerSettings.company_name}</h3>
            {footerSettings.about_text && (
              <p className="text-sm text-muted-foreground">{footerSettings.about_text}</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="/clans" className="text-muted-foreground hover:text-primary transition-colors">Clans</a></li>
              <li><a href="/sports" className="text-muted-foreground hover:text-primary transition-colors">Sports</a></li>
              <li><a href="/schedule" className="text-muted-foreground hover:text-primary transition-colors">Schedule</a></li>
              <li><a href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">Leaderboard</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {footerSettings.contact_email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${footerSettings.contact_email}`} className="text-muted-foreground hover:text-primary transition-colors break-all">
                    {footerSettings.contact_email}
                  </a>
                </li>
              )}
              {footerSettings.contact_phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <a href={`tel:${footerSettings.contact_phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {footerSettings.contact_phone}
                  </a>
                </li>
              )}
              {footerSettings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{footerSettings.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          {footerSettings.show_newsletter && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">Subscribe to get the latest updates and news.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1"
                />
                <Button size="sm" className="whitespace-nowrap">Subscribe</Button>
              </div>
            </div>
          )}
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">{copyrightText}</p>
          
          {footerSettings.show_social_links && (
            <div className="flex gap-4">
              {footerSettings.facebook_url && (
                <a href={footerSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {footerSettings.twitter_url && (
                <a href={footerSettings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {footerSettings.instagram_url && (
                <a href={footerSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {footerSettings.linkedin_url && (
                <a href={footerSettings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {footerSettings.youtube_url && (
                <a href={footerSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
