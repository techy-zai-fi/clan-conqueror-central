import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { upcomingMatches } from '@/data/mockData';

export default function UpcomingMatches() {
  const nextMatches = upcomingMatches.slice(0, 3);

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Coming Up Next
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextMatches.map((match) => (
          <div
            key={match.id}
            className="p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">{match.sportName}</span>
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
              {match.status === 'live' && (
                <div className="text-primary font-semibold mt-2">
                  Score: {match.score1} - {match.score2}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
