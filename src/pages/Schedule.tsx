import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  sport_name: string;
  clan1: string;
  clan2: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  score1: number | null;
  score2: number | null;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
}

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const sportId = searchParams.get('sport');
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [sportName, setSportName] = useState<string>('');
  const [sportsMap, setSportsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all sports to get icons
      const { data: sportsData } = await supabase
        .from('sports')
        .select('id, name, icon');
      
      if (sportsData) {
        const map: Record<string, string> = {};
        sportsData.forEach((sport: Sport) => {
          map[sport.name] = sport.icon;
        });
        setSportsMap(map);
      }

      let query = supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

      if (sportId) {
        query = query.eq('sport_id', sportId);
        
        // Fetch the sport name
        const { data: sportData } = await supabase
          .from('sports')
          .select('name')
          .eq('id', sportId)
          .single();
        
        if (sportData) {
          setSportName(sportData.name);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      setMatches(data || []);
    };

    fetchData();
  }, [sportId]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {sportName ? `${sportName} ` : 'Match '}<span className="text-accent">Schedule</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {sportName ? `All ${sportName} matches` : 'All upcoming and live matches'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {matches.map((match, index) => (
            <Card
              key={match.id}
              className="animate-slide-up bg-gradient-to-br from-card to-secondary/20 border-2 hover:border-primary/50 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                    <span className="text-2xl md:text-4xl">{sportsMap[match.sport_name] || '🏅'}</span>
                    <span className="hidden sm:inline">{match.sport_name}</span>
                  </CardTitle>
                  {match.status === 'live' && (
                    <Badge variant="destructive" className="animate-pulse text-sm md:text-lg px-3 md:px-4 py-1">
                      LIVE
                    </Badge>
                  )}
                  {match.status === 'upcoming' && (
                    <Badge variant="secondary" className="text-sm md:text-lg px-3 md:px-4 py-1">
                      Upcoming
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Teams */}
                <div className="flex items-center justify-center gap-3 md:gap-6 py-4">
                  <div className="text-center flex-1">
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-foreground">{match.clan1}</div>
                    {match.status === 'live' && (
                      <div className="text-2xl md:text-3xl font-bold text-accent mt-2">{match.score1}</div>
                    )}
                  </div>
                  
                  <div className="text-xl md:text-3xl font-bold text-muted-foreground">VS</div>
                  
                  <div className="text-center flex-1">
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-foreground">{match.clan2}</div>
                    {match.status === 'live' && (
                      <div className="text-2xl md:text-3xl font-bold text-accent mt-2">{match.score2}</div>
                    )}
                  </div>
                </div>

                {/* Match Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="font-medium text-foreground">
                        {new Date(match.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5 text-accent" />
                    <div>
                      <div className="text-xs text-muted-foreground">Time</div>
                      <div className="font-medium text-foreground">{match.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Venue</div>
                      <div className="font-medium text-foreground">{match.venue}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {matches.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Matches Scheduled
              </h3>
              <p className="text-muted-foreground">
                Check back soon for upcoming matches
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
