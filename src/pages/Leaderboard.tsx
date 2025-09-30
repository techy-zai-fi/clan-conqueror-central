import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, TrendingUp, Award } from 'lucide-react';
import { clans } from '@/data/mockData';

export default function Leaderboard() {
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
              <Trophy className="h-8 w-8 text-yellow-400" />,
              <Medal className="h-8 w-8 text-zinc-400" />,
              <Medal className="h-8 w-8 text-amber-700" />
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6 flex-1">
                      {/* Rank */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        {isTop3 ? (
                          <div className="mb-2">{icons[index]}</div>
                        ) : (
                          <div className="text-3xl font-bold text-muted-foreground mb-2">
                            {index + 1}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">RANK</span>
                      </div>

                      {/* Clan Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="text-5xl md:text-6xl p-3 rounded-xl"
                          style={{ backgroundColor: `${clan.color}20` }}
                        >
                          {clan.logo}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-foreground">
                            {clan.name}
                          </h3>
                          <p className="text-sm text-muted-foreground italic mt-1">
                            {clan.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: clan.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {clan.mascot}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="flex flex-col items-center min-w-[100px]">
                        <div className="text-4xl font-bold text-accent mb-1">
                          {clan.totalPoints}
                        </div>
                        <span className="text-xs text-muted-foreground">POINTS</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Cards */}
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
              <div className="text-lg text-accent mt-1">{clans[0].totalPoints} points</div>
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
              <div className="text-lg text-accent mt-1">12 victories</div>
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
                {clans[0].totalPoints - clans[1].totalPoints}
              </div>
              <div className="text-sm text-muted-foreground mt-1">1st to 2nd place</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
