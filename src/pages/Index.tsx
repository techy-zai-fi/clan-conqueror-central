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
  color: string;
  total_points: number;
}

interface Highlight {
  id: string;
  date: string;
  description: string;
}

interface SiteSettings {
  logo_url: string | null;
  hero_logo_url: string | null;
  itcom_logo_url: string | null;
  active_leaderboard_type: string;
  show_sponsors: boolean;
}

interface AggregatedLeagueStanding {
  clan_name: string;
  group_name: string;
  total_points: number;
  clan?: Clan;
}

export default function Index() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<AggregatedLeagueStanding[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [totalClans, setTotalClans] = useState(0);
  const [totalSports, setTotalSports] = useState(0);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch site settings first to determine leaderboard type
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('logo_url, hero_logo_url, itcom_logo_url, active_leaderboard_type, show_sponsors')
      .limit(1)
      .maybeSingle();
    
    if (settingsData) setSiteSettings(settingsData);

    const leaderboardType = settingsData?.active_leaderboard_type || 'playoff';

    // Fetch clans for both modes (needed for logo/color info)
    const { data: clansData } = await supabase
      .from('clans')
      .select('*')
      .order('total_points', { ascending: false, nullsFirst: false });
    
    if (clansData) {
      setClans(clansData);
      setTotalClans(clansData.length);
    }

    // Fetch appropriate leaderboard data
    if (leaderboardType === 'league') {
      // Fetch league standings and aggregate by clan across all sports
      const { data: standingsData } = await supabase
        .from('league_standings')
        .select('clan_name, group_name, total_points');
      
      if (standingsData) {
        // Aggregate points by clan_name and group_name across all sports
        const aggregated: Record<string, AggregatedLeagueStanding> = {};
        
        standingsData.forEach((standing) => {
          const key = `${standing.clan_name}-${standing.group_name}`;
          if (!aggregated[key]) {
            aggregated[key] = {
              clan_name: standing.clan_name,
              group_name: standing.group_name,
              total_points: 0,
              clan: clansData?.find(c => c.name === standing.clan_name)
            };
          }
          aggregated[key].total_points += standing.total_points || 0;
        });
        
        const sortedStandings = Object.values(aggregated).sort((a, b) => b.total_points - a.total_points);
        setLeagueStandings(sortedStandings);
      }
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

  // Group league standings by group
  const groupA = leagueStandings.filter(s => s.group_name === 'Group A').sort((a, b) => b.total_points - a.total_points);
  const groupB = leagueStandings.filter(s => s.group_name === 'Group B').sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-screen bg-cover bg-center flex items-start justify-center pt-6 md:pt-10"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${heroBanner})` }}
      >
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 px-4 animate-fade-in max-w-5xl mx-auto">
          {siteSettings?.hero_logo_url && (
            <div className="flex justify-center mb-4 md:mb-8">
              <img 
                src={siteSettings.hero_logo_url} 
                alt="Event Logo" 
                className="h-32 sm:h-40 md:h-52 lg:h-64 w-auto object-contain rounded-2xl"
              />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
            Clash of <span className="text-accent">Clans</span> 2025
          </h1>
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
            IIM Bodh Gaya's Premier Intra-College Sports Championship
          </p>
          <div className="flex items-center justify-center gap-2 md:gap-3 pt-2">
            <span className="text-xs sm:text-sm md:text-base text-muted-foreground">By ITCOM</span>
            {siteSettings?.itcom_logo_url && (
              <img 
                src={siteSettings.itcom_logo_url} 
                alt="ITCOM Logo" 
                className="h-6 sm:h-8 md:h-10 w-auto object-contain"
              />
            )}
          </div>
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
          <Podium leaderboardType={siteSettings?.active_leaderboard_type || 'playoff'} leagueStandings={leagueStandings} clans={clans} />
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
                {siteSettings?.active_leaderboard_type === 'league' ? 'League Standings' : 'Overall Standings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {siteSettings?.active_leaderboard_type === 'league' ? (
                <>
                  {/* Group A */}
                  {groupA.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Group A</h4>
                      {groupA.map((standing, index) => (
                        <div
                          key={`${standing.clan_name}-A-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all mb-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-muted-foreground w-6">
                              {index + 1}
                            </span>
                            {standing.clan?.logo && (
                              <span className="text-2xl">
                                {standing.clan.logo.startsWith('http') ? (
                                  <img src={standing.clan.logo} alt={standing.clan_name} className="h-6 w-6 object-contain" />
                                ) : (
                                  standing.clan.logo
                                )}
                              </span>
                            )}
                            <div className="font-semibold text-sm">{standing.clan_name}</div>
                          </div>
                          <div className="text-xl font-bold text-accent">{standing.total_points}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Group B */}
                  {groupB.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Group B</h4>
                      {groupB.map((standing, index) => (
                        <div
                          key={`${standing.clan_name}-B-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all mb-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-muted-foreground w-6">
                              {index + 1}
                            </span>
                            {standing.clan?.logo && (
                              <span className="text-2xl">
                                {standing.clan.logo.startsWith('http') ? (
                                  <img src={standing.clan.logo} alt={standing.clan_name} className="h-6 w-6 object-contain" />
                                ) : (
                                  standing.clan.logo
                                )}
                              </span>
                            )}
                            <div className="font-semibold text-sm">{standing.clan_name}</div>
                          </div>
                          <div className="text-xl font-bold text-accent">{standing.total_points}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
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
        {siteSettings?.show_sponsors && <Sponsors />}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
