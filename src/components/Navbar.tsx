import { Link, useLocation } from 'react-router-dom';
import { Trophy, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/clans', label: 'Clans' },
  { to: '/sports', label: 'Sports' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/announcements', label: 'Announcements' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Trophy className="h-8 w-8 text-accent" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Clash of Clans</span>
              <span className="text-xs text-muted-foreground">IIM Bodh Gaya 2025</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={location.pathname === link.to ? 'default' : 'ghost'}
                  className="transition-all"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={location.pathname === link.to ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
