import { Trophy, Medal, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Clan {
  id: string;
  name: string;
  logo: string;
  color: string;
  total_points: number;
  gold_medals?: number;
  silver_medals?: number;
  bronze_medals?: number;
}

interface AggregatedLeagueStanding {
  clan_name: string;
  group_name: string;
  total_points: number;
  clan?: Clan;
}

interface PodiumProps {
  leaderboardType: string;
  leagueStandings: AggregatedLeagueStanding[];
  clans: Clan[];
}

export default function Podium({ leaderboardType, leagueStandings, clans }: PodiumProps) {
  // For playoff mode, use clans sorted by total_points
  const topClans = clans.slice(0, 3);

  // For league mode, group by Group A and Group B (handles both "A"/"B" and "Group A"/"Group B" formats)
  const groupA = leagueStandings.filter(s => s.group_name === 'A' || s.group_name === 'Group A').sort((a, b) => b.total_points - a.total_points);
  const groupB = leagueStandings.filter(s => s.group_name === 'B' || s.group_name === 'Group B').sort((a, b) => b.total_points - a.total_points);

  const renderPlayoffPodium = () => {
    if (topClans.length < 3) return null;

    const [first, second, third] = topClans;

    return (
      <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8">
        {/* Second Place */}
        <Card 
          className="relative flex flex-col items-center p-3 sm:p-4 md:p-6 bg-gradient-to-b from-card to-secondary/30 border-2 animate-podium-rise w-24 sm:w-32 md:w-auto"
          style={{ 
            animationDelay: '0.2s',
            borderColor: second.color,
            boxShadow: `0 0 30px ${second.color}40`
          }}
        >
          <div className="absolute -top-2 sm:-top-3 md:-top-4 bg-secondary border-2 border-border rounded-full p-1 sm:p-1.5 md:p-2">
            <Medal className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-zinc-400" />
          </div>
          <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-3">
            {second.logo.startsWith('http') ? (
              <img src={second.logo} alt={second.name} className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain" />
            ) : (
              second.logo
            )}
          </div>
          <h3 className="text-xs sm:text-sm md:text-lg font-bold text-center mb-1 truncate w-full">{second.name}</h3>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-yellow-400 text-xs">🥇{second.gold_medals || 0}</span>
            <span className="text-zinc-400 text-xs">🥈{second.silver_medals || 0}</span>
            <span className="text-amber-700 text-xs">🥉{second.bronze_medals || 0}</span>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">{second.total_points} pts</p>
          <div className="w-16 h-20 sm:w-18 sm:h-28 md:w-20 md:h-32 bg-gradient-to-t from-zinc-400/30 to-transparent rounded-t-lg" />
          <div className="mt-1 sm:mt-1.5 md:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-zinc-400">2nd</div>
        </Card>

        {/* First Place */}
        <Card 
          className="relative flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-accent/20 to-card border-2 animate-podium-rise w-28 sm:w-40 md:w-auto"
          style={{ 
            borderColor: first.color,
            boxShadow: `0 0 40px ${first.color}60, var(--shadow-gold)`
          }}
        >
          <div className="absolute -top-3 sm:-top-4 md:-top-5 bg-gradient-to-br from-accent to-yellow-500 border-2 border-accent rounded-full p-1.5 sm:p-2 md:p-3 animate-pulse-glow">
            <Trophy className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-background" />
          </div>
          <div className="text-4xl sm:text-5xl md:text-7xl mb-2 sm:mb-3 md:mb-4">
            {first.logo.startsWith('http') ? (
              <img src={first.logo} alt={first.name} className="h-10 w-10 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" />
            ) : (
              first.logo
            )}
          </div>
          <h3 className="text-sm sm:text-base md:text-xl font-bold text-center mb-1 md:mb-2 truncate w-full">{first.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-sm">🥇{first.gold_medals || 0}</span>
            <span className="text-zinc-400 text-sm">🥈{first.silver_medals || 0}</span>
            <span className="text-amber-700 text-sm">🥉{first.bronze_medals || 0}</span>
          </div>
          <p className="text-xl sm:text-3xl md:text-4xl font-bold text-accent mb-2 md:mb-3">{first.total_points} pts</p>
          <div className="w-20 h-32 sm:w-22 sm:h-42 md:w-24 md:h-48 bg-gradient-to-t from-accent/40 via-accent/20 to-transparent rounded-t-lg" />
          <div className="mt-2 sm:mt-2.5 md:mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-accent">1st</div>
        </Card>

        {/* Third Place */}
        <Card 
          className="relative flex flex-col items-center p-3 sm:p-4 md:p-6 bg-gradient-to-b from-card to-secondary/30 border-2 animate-podium-rise w-24 sm:w-32 md:w-auto"
          style={{ 
            animationDelay: '0.4s',
            borderColor: third.color,
            boxShadow: `0 0 30px ${third.color}40`
          }}
        >
          <div className="absolute -top-2 sm:-top-3 md:-top-4 bg-secondary border-2 border-border rounded-full p-1 sm:p-1.5 md:p-2">
            <Medal className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-amber-700" />
          </div>
          <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-3">
            {third.logo.startsWith('http') ? (
              <img src={third.logo} alt={third.name} className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain" />
            ) : (
              third.logo
            )}
          </div>
          <h3 className="text-xs sm:text-sm md:text-lg font-bold text-center mb-1 truncate w-full">{third.name}</h3>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-yellow-400 text-xs">🥇{third.gold_medals || 0}</span>
            <span className="text-zinc-400 text-xs">🥈{third.silver_medals || 0}</span>
            <span className="text-amber-700 text-xs">🥉{third.bronze_medals || 0}</span>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">{third.total_points} pts</p>
          <div className="w-16 h-16 sm:w-18 sm:h-20 md:w-20 md:h-24 bg-gradient-to-t from-amber-700/30 to-transparent rounded-t-lg" />
          <div className="mt-1 sm:mt-1.5 md:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-amber-700">3rd</div>
        </Card>
      </div>
    );
  };

  const renderGroupStandings = (standings: AggregatedLeagueStanding[], groupName: string, colorClass: string) => {
    if (standings.length === 0) return null;

    return (
      <Card className="p-4 md:p-6 bg-gradient-to-b from-card to-secondary/30 border-2 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className={`h-5 w-5 ${colorClass}`} />
          <h3 className="text-lg md:text-xl font-bold">{groupName}</h3>
        </div>
        <div className="space-y-3">
          {standings.map((standing, index) => {
            const clan = standing.clan;
            const isFirst = index === 0;
            
            return (
              <div
                key={`${standing.clan_name}-${groupName}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isFirst ? 'bg-accent/10 border-accent/50' : 'bg-background/50 border-border'
                }`}
                style={clan ? { borderLeftColor: clan.color, borderLeftWidth: '4px' } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold w-6 ${isFirst ? 'text-accent' : 'text-muted-foreground'}`}>
                    {index + 1}
                  </span>
                  {clan?.logo && (
                    <span className="text-2xl">
                      {clan.logo.startsWith('http') ? (
                        <img src={clan.logo} alt={standing.clan_name} className="h-8 w-8 object-contain" />
                      ) : (
                        clan.logo
                      )}
                    </span>
                  )}
                  <div className="font-semibold">{standing.clan_name}</div>
                </div>
                <div className={`text-xl font-bold ${isFirst ? 'text-accent' : 'text-foreground'}`}>
                  {standing.total_points} pts
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderLeaguePodium = () => {
    if (groupA.length === 0 && groupB.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">No league standings available yet.</p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {renderGroupStandings(groupA, 'Group A', 'text-primary')}
        {renderGroupStandings(groupB, 'Group B', 'text-accent')}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-accent" />
          {leaderboardType === 'league' ? 'League Standings' : 'Current Standings'}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {leaderboardType === 'league' ? 'Aggregated points across all sports' : 'Live podium updates'}
        </p>
      </div>

      {leaderboardType === 'league' ? renderLeaguePodium() : renderPlayoffPodium()}
    </div>
  );
}
