import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Menu, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/clans', label: 'Clans' },
  { to: '/sports', label: 'Sports' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/gallery', label: 'Gallery' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [siteSettings, setSiteSettings] = useState({
    logo_url: null as string | null,
    site_name: 'Clash of Clans',
    site_subtitle: 'IIM Bodh Gaya 2025',
  });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSiteSettings({
          logo_url: data.logo_url,
          site_name: data.site_name || 'Clash of Clans',
          site_subtitle: data.site_subtitle || 'IIM Bodh Gaya 2025',
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  return (
    <nav className="sticky z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-white" style={{ top: 'env(safe-area-inset-top, 0)' }}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 text-white">
            {siteSettings.logo_url ? (
              <img src={siteSettings.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <Trophy className="h-8 w-8 text-accent" />
            )}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">{siteSettings.site_name}</span>
              {siteSettings.site_subtitle && (
                <span className="text-xs text-white/70">{siteSettings.site_subtitle}</span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={location.pathname === link.to ? 'default' : 'ghost'}
                  className="transition-all text-white"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant={location.pathname === '/admin' ? 'default' : 'ghost'}
                  className="transition-all text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            {user ? (
              <>
                <span className="text-sm text-white ml-2">{user.email?.split('@')[0]}</span>
                <Button variant="outline" size="sm" onClick={signOut} className="ml-2 text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="ml-2 text-white">
                Login
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] text-white">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={location.pathname === link.to ? 'default' : 'ghost'}
                      className="w-full justify-start text-white"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin">
                    <Button
                      variant={location.pathname === '/admin' ? 'default' : 'ghost'}
                      className="w-full justify-start text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <>
                      <p className="text-sm text-white mb-2">{user.email}</p>
                      <Button variant="outline" size="sm" className="w-full text-white" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full text-white" onClick={() => navigate('/auth')}>
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}