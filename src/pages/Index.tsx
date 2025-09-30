import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Podium from '@/components/Podium';
import UpcomingMatches from '@/components/UpcomingMatches';
import AnnouncementsBanner from '@/components/AnnouncementsBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';
import { clans, highlights } from '@/data/mockData';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${heroBanner})` }}
      >
        <div className="text-center space-y-6 px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            Clash of <span className="text-accent">Clans</span> 2025
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            IIM Bodh Gaya's Premier Intra-College Sports Championship
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/leaderboard">
              <Button size="lg" className="gap-2">
                <Trophy className="h-5 w-5" />
                View Leaderboard
              </Button>
            </Link>
            <Link to="/schedule">
              <Button size="lg" variant="secondary" className="gap-2">
                <Calendar className="h-5 w-5" />
                Match Schedule
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Announcements */}
        <AnnouncementsBanner />

        {/* Podium Section */}
        <section className="animate-scale-in">
          <Podium />
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/20 to-card border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary flex items-center gap-2">
                <Users className="h-8 w-8" />
                6
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/20 to-card border-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sports Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent flex items-center gap-2">
                <Trophy className="h-8 w-8" />
                8
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-card border-green-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Matches Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">42</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-card border-purple-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-500">350+</div>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              {clans.map((clan, index) => (
                <div
                  key={clan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      {index + 1}
                    </span>
                    <span className="text-3xl">{clan.logo}</span>
                    <div>
                      <div className="font-semibold">{clan.name}</div>
                      <div className="text-xs text-muted-foreground">{clan.tagline}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-accent">{clan.totalPoints}</div>
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
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="p-4 rounded-lg bg-background/50 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-accent mt-1" />
                    <div>
                      <p className="font-medium text-foreground">{highlight.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(highlight.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
