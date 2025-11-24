import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, TrendingUp, Award } from 'lucide-react';

interface Clan {
  id: string;
  name: string;
  tagline: string;
  color: string;
  logo: string;
  mascot: string;
  total_points: number;
  rank: number | null;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
}

export default function Leaderboard() {
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
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-accent" />
            Overall <span className="text-accent">Leaderboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Live standings updated after each match
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {clans.map((clan, index) => {
            const isTop3 = index < 3;
            const icons = [
              <Trophy key="1" className="h-8 w-8 text-yellow-400" />,
              <Medal key="2" className="h-8 w-8 text-zinc-400" />,
              <Medal key="3" className="h-8 w-8 text-amber-700" />
            ];

            return (
              <Card
                key={clan.id}
                className={`animate-slide-up border-2 ${
                  isTop3 ? 'bg-gradient-to-r from-card via-secondary/30 to-card' : 'bg-card'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  borderColor: isTop3 ? clan.color : 'hsl(var(--border))',
                  boxShadow: isTop3 ? `0 0 30px ${clan.color}40` : 'none'
                }}
              >
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
                      {/* Rank */}
                      <div className="flex flex-col items-center min-w-[40px] md:min-w-[60px]">
                        {isTop3 ? (
                          <div className="mb-1 md:mb-2">{icons[index]}</div>
                        ) : (
                          <div className="text-2xl md:text-3xl font-bold text-muted-foreground mb-1 md:mb-2">
                            {index + 1}
                          </div>
                        )}
                        <span className="text-[10px] md:text-xs text-muted-foreground">RANK</span>
                      </div>

                      {/* Clan Info */}
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div 
                          className="text-3xl md:text-5xl lg:text-6xl p-2 md:p-3 rounded-xl flex-shrink-0"
                          style={{ backgroundColor: `${clan.color}20` }}
                        >
                          {clan.logo && clan.logo.startsWith('http') ? (
                            <img src={clan.logo} alt={clan.name} className="h-8 md:h-12 w-8 md:w-12 object-contain" />
                          ) : (
                            clan.logo
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-foreground truncate">
                            {clan.name}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground italic mt-1 line-clamp-1">
                            {clan.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-1 md:mt-2">
                            <div 
                              className="w-3 md:w-4 h-3 md:h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: clan.color }}
                            />
                            <span className="text-[10px] md:text-xs text-muted-foreground truncate">
                              {clan.mascot}
                            </span>
                          </div>
                        </div>
                      </div>

                       {/* Medals */}
                      <div className="hidden sm:flex items-center gap-1 md:gap-2 min-w-[100px] md:min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 mb-1" />
                          <span className="text-xs md:text-sm font-bold">{clan.gold_medals || 0}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Medal className="h-4 w-4 md:h-5 md:w-5 text-zinc-400 mb-1" />
                          <span className="text-xs md:text-sm font-bold">{clan.silver_medals || 0}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Medal className="h-4 w-4 md:h-5 md:w-5 text-amber-700 mb-1" />
                          <span className="text-xs md:text-sm font-bold">{clan.bronze_medals || 0}</span>
                        </div>
                      </div>

                       {/* Points */}
                      <div className="flex flex-col items-center min-w-[60px] md:min-w-[100px]">
                        <div className="text-2xl md:text-4xl font-bold text-accent mb-1">
                          {clan.total_points}
                        </div>
                        <span className="text-[10px] md:text-xs text-muted-foreground">POINTS</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Cards */}
        {clans.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/20 to-card border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Highest Scorer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{clans[0].name}</div>
                <div className="text-lg text-accent mt-1">{clans[0].total_points} points</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/20 to-card border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Award className="h-5 w-5 text-accent" />
                  Most Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{clans[0].name}</div>
                <div className="text-lg text-accent mt-1">Leading</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-card border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="h-5 w-5 text-green-500" />
                  Point Gap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {clans[0].total_points - clans[1].total_points}
                </div>
                <div className="text-sm text-muted-foreground mt-1">1st to 2nd place</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}