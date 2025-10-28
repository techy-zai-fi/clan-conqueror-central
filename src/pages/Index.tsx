import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Podium from '@/components/Podium';
import UpcomingMatches from '@/components/UpcomingMatches';
import AnnouncementsBanner from '@/components/AnnouncementsBanner';
import Sponsors from '@/components/Sponsors';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

interface Clan {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  total_points: number;
}

interface Highlight {
  id: string;
  date: string;
  description: string;
}

export default function Index() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [totalClans, setTotalClans] = useState(0);
  const [totalSports, setTotalSports] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch clans
    const { data: clansData } = await supabase
      .from('clans')
      .select('*')
      .order('rank', { ascending: true, nullsFirst: false });
    
    if (clansData) {
      setClans(clansData);
      setTotalClans(clansData.length);
    }

    // Fetch highlights
    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (highlightsData) setHighlights(highlightsData);

    // Fetch sports count
    const { count } = await supabase
      .from('sports')
      .select('*', { count: 'exact', head: true });
    
    if (count) setTotalSports(count);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${heroBanner})` }}
      >
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 px-4 animate-fade-in max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
            Clash of <span className="text-accent">Clans</span> 2025
          </h1>
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
            IIM Bodh Gaya's Premier Intra-College Sports Championship
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2">
            <Link to="/leaderboard" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full">
                <Trophy className="h-4 md:h-5 w-4 md:w-5" />
                <span className="text-sm md:text-base">View Leaderboard</span>
              </Button>
            </Link>
            <Link to="/schedule" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="gap-2 w-full">
                <Calendar className="h-4 md:h-5 w-4 md:w-5" />
                <span className="text-sm md:text-base">Match Schedule</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-12 space-y-8 md:space-y-16">
        {/* Announcements */}
        <AnnouncementsBanner />

        {/* Podium Section */}
        <section className="animate-scale-in">
          <Podium />
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-gradient-to-br from-primary/20 to-card border-primary/50">
            <CardHeader className="p-3 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Clans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl md:text-4xl font-bold text-primary flex items-center gap-1 md:gap-2">
                <Users className="h-5 md:h-8 w-5 md:w-8" />
                {totalClans}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/20 to-card border-accent/50">
            <CardHeader className="p-3 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Sports Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl md:text-4xl font-bold text-accent flex items-center gap-1 md:gap-2">
                <Trophy className="h-5 md:h-8 w-5 md:w-8" />
                {totalSports}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-card border-green-500/50">
            <CardHeader className="p-3 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Matches Played
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl md:text-4xl font-bold text-green-500">42</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-card border-purple-500/50">
            <CardHeader className="p-3 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl md:text-4xl font-bold text-purple-500">350+</div>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Upcoming Matches */}
          <div className="lg:col-span-2">
            <UpcomingMatches />
          </div>

          {/* Overall Leaderboard Preview */}
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Overall Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clans.slice(0, 6).map((clan, index) => (
                <div
                  key={clan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      {index + 1}
                    </span>
                    <span className="text-3xl">
                      {clan.logo && clan.logo.startsWith('http') ? (
                        <img src={clan.logo} alt={clan.name} className="h-8 w-8 object-contain" />
                      ) : (
                        clan.logo
                      )}
                    </span>
                    <div>
                      <div className="font-semibold">{clan.name}</div>
                      <div className="text-xs text-muted-foreground">{clan.tagline}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-accent">{clan.total_points}</div>
                </div>
              ))}
              <Link to="/leaderboard">
                <Button className="w-full mt-4" variant="outline">
                  View Full Leaderboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Daily Highlights */}
        <section>
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader>
              <CardTitle>Highlights of the Day</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {highlights.length > 0 ? (
                highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="p-4 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-accent mt-1" />
                      <div>
                        <p className="font-medium text-foreground">{highlight.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">{highlight.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No highlights yet. Check back soon!</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Sponsors Section */}
        <Sponsors />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}