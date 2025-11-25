import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';

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
  winner: string | null;
  category: string | null;
  stage: string | null;
  group_name: string | null;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function SportSchedule() {
  const { sportId } = useParams<{ sportId: string }>();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [sport, setSport] = useState<Sport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch sport details
      const { data: sportData } = await supabase
        .from('sports')
        .select('*')
        .eq('id', sportId)
        .single();
      
      if (sportData) {
        setSport(sportData);
      }

      // Fetch matches for this sport
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .eq('sport_id', sportId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching matches:', error);
      } else {
        setMatches(matchesData || []);
      }
      
      setLoading(false);
    };

    if (sportId) {
      fetchData();
    }
  }, [sportId]);

  const getStatusBadge = (match: Match) => {
    if (match.status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (match.status === 'live') {
      return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const getMatchTitle = (match: Match) => {
    const parts = [];
    if (match.category) parts.push(match.category);
    if (match.stage) parts.push(match.stage);
    if (match.group_name) parts.push(match.group_name);
    return parts.join(' • ');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/sports">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sports
          </Button>
        </Link>

        {sport && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="text-6xl md:text-8xl mb-4">{sport.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {sport.name} <span className="text-accent">Schedule & Results</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {sport.description}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground">Loading matches...</div>
        ) : matches.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No matches scheduled yet for this sport.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {matches.map((match) => (
              <Card 
                key={match.id}
                className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-secondary/10"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl">
                      {getMatchTitle(match) && (
                        <span className="text-sm text-muted-foreground">
                          {getMatchTitle(match)}
                        </span>
                      )}
                    </CardTitle>
                    {getStatusBadge(match)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    {/* Clan 1 */}
                    <div className="text-center md:text-right">
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {match.clan1}
                      </p>
                      {match.status === 'completed' && match.score1 !== null && (
                        <p className="text-3xl md:text-4xl font-bold text-accent mt-2">
                          {match.score1}
                        </p>
                      )}
                      {match.status === 'live' && match.score1 !== null && (
                        <p className="text-3xl md:text-4xl font-bold text-accent mt-2 animate-pulse">
                          {match.score1}
                        </p>
                      )}
                    </div>

                    {/* VS / Winner Info */}
                    <div className="text-center">
                      <p className="text-lg md:text-xl text-muted-foreground font-semibold">
                        VS
                      </p>
                      {match.status === 'completed' && match.winner && (
                        <p className="text-sm text-accent mt-1 font-medium">
                          Winner: {match.winner}
                        </p>
                      )}
                    </div>

                    {/* Clan 2 */}
                    <div className="text-center md:text-left">
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {match.clan2}
                      </p>
                      {match.status === 'completed' && match.score2 !== null && (
                        <p className="text-3xl md:text-4xl font-bold text-accent mt-2">
                          {match.score2}
                        </p>
                      )}
                      {match.status === 'live' && match.score2 !== null && (
                        <p className="text-3xl md:text-4xl font-bold text-accent mt-2 animate-pulse">
                          {match.score2}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{match.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{match.venue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
