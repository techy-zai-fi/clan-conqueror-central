import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Match {
  id: string;
  sport_name: string;
  clan1: string;
  clan2: string;
  time: string;
  venue: string;
  status: string;
  score1: number | null;
  score2: number | null;
}

export default function UpcomingMatches() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or('status.eq.upcoming,status.eq.live')
      .order('date', { ascending: true })
      .limit(3);
    
    if (data) setMatches(data as Match[]);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Coming Up Next
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No upcoming matches scheduled</p>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">{match.sport_name}</span>
                {match.status === 'live' && (
                  <Badge variant="destructive" className="animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">
                  {match.clan1} vs {match.clan2}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {match.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.venue}
                  </span>
                </div>
                {match.status === 'live' && match.score1 !== null && match.score2 !== null && (
                  <div className="text-primary font-semibold mt-2">
                    Score: {match.score1} - {match.score2}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}