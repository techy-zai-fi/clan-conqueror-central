import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Target } from 'lucide-react';

interface Clan {
  id: string;
  name: string;
  tagline: string;
  color: string;
  logo: string;
  mascot: string;
  total_points: number;
  rank: number | null;
}

export default function Clans() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('*')
      .order('rank', { ascending: true, nullsFirst: false });
    
    if (data) setClans(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading clans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            The <span className="text-accent">Clans</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the warriors competing for glory in Clash of Clans 2025
          </p>
        </div>

        {clans.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>No clans available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clans.map((clan, index) => (
              <Card 
                key={clan.id}
                className="h-full hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in border-2"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  borderColor: clan.color,
                  boxShadow: `0 0 30px ${clan.color}40`
                }}
              >
                <CardHeader 
                  className="text-center pb-4"
                  style={{
                    background: `linear-gradient(135deg, ${clan.color}20 0%, transparent 100%)`
                  }}
                >
                  <div className="text-7xl mb-4">{clan.logo}</div>
                  <CardTitle className="text-2xl mb-2">{clan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground italic">"{clan.tagline}"</p>
                  {clan.rank && (
                    <Badge 
                      className="mt-3"
                      style={{ backgroundColor: clan.color }}
                    >
                      Rank #{clan.rank}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      <span className="font-medium">Total Points</span>
                    </div>
                    <span className="text-2xl font-bold text-accent">{clan.total_points}</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                    <Target className="h-5 w-5" style={{ color: clan.color }} />
                    <span className="font-medium">Mascot:</span>
                    <span className="text-muted-foreground">{clan.mascot}</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                    <Users className="h-5 w-5" style={{ color: clan.color }} />
                    <span className="font-medium">Team Spirit:</span>
                    <span className="text-accent">Unbreakable</span>
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