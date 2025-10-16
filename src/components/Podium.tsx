import { Trophy, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Clan {
  id: string;
  name: string;
  logo: string;
  color: string;
  total_points: number;
}

export default function Podium() {
  const [topClans, setTopClans] = useState<Clan[]>([]);

  useEffect(() => {
    const fetchTopClans = async () => {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching clans:', error);
        return;
      }

      setTopClans(data || []);
    };

    fetchTopClans();
  }, []);

  if (topClans.length < 3) return null;

  const [first, second, third] = topClans;

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-accent" />
          Current Standings
        </h2>
        <p className="text-muted-foreground">Live podium updates</p>
      </div>

      <div className="flex items-end justify-center gap-4 md:gap-8">
        {/* Second Place */}
        <Card 
          className="relative flex flex-col items-center p-6 bg-gradient-to-b from-card to-secondary/30 border-2 animate-podium-rise"
          style={{ 
            animationDelay: '0.2s',
            borderColor: second.color,
            boxShadow: `0 0 30px ${second.color}40`
          }}
        >
          <div className="absolute -top-4 bg-secondary border-2 border-border rounded-full p-2">
            <Medal className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="text-6xl mb-3">
            {second.logo.startsWith('http') ? (
              <img src={second.logo} alt={second.name} className="h-16 w-16 object-contain" />
            ) : (
              second.logo
            )}
          </div>
          <h3 className="text-lg font-bold text-center mb-1">{second.name}</h3>
          <p className="text-3xl font-bold text-foreground mb-2">{second.total_points}</p>
          <div className="w-20 h-32 bg-gradient-to-t from-zinc-400/30 to-transparent rounded-t-lg" />
          <div className="mt-2 text-2xl font-bold text-zinc-400">2nd</div>
        </Card>

        {/* First Place */}
        <Card 
          className="relative flex flex-col items-center p-8 bg-gradient-to-b from-accent/20 to-card border-2 animate-podium-rise"
          style={{ 
            borderColor: first.color,
            boxShadow: `0 0 40px ${first.color}60, var(--shadow-gold)`
          }}
        >
          <div className="absolute -top-5 bg-gradient-to-br from-accent to-yellow-500 border-2 border-accent rounded-full p-3 animate-pulse-glow">
            <Trophy className="h-8 w-8 text-background" />
          </div>
          <div className="text-7xl mb-4">
            {first.logo.startsWith('http') ? (
              <img src={first.logo} alt={first.name} className="h-20 w-20 object-contain" />
            ) : (
              first.logo
            )}
          </div>
          <h3 className="text-xl font-bold text-center mb-2">{first.name}</h3>
          <p className="text-4xl font-bold text-accent mb-3">{first.total_points}</p>
          <div className="w-24 h-48 bg-gradient-to-t from-accent/40 via-accent/20 to-transparent rounded-t-lg" />
          <div className="mt-3 text-3xl font-bold text-accent">1st</div>
        </Card>

        {/* Third Place */}
        <Card 
          className="relative flex flex-col items-center p-6 bg-gradient-to-b from-card to-secondary/30 border-2 animate-podium-rise"
          style={{ 
            animationDelay: '0.4s',
            borderColor: third.color,
            boxShadow: `0 0 30px ${third.color}40`
          }}
        >
          <div className="absolute -top-4 bg-secondary border-2 border-border rounded-full p-2">
            <Medal className="h-6 w-6 text-amber-700" />
          </div>
          <div className="text-6xl mb-3">
            {third.logo.startsWith('http') ? (
              <img src={third.logo} alt={third.name} className="h-16 w-16 object-contain" />
            ) : (
              third.logo
            )}
          </div>
          <h3 className="text-lg font-bold text-center mb-1">{third.name}</h3>
          <p className="text-3xl font-bold text-foreground mb-2">{third.total_points}</p>
          <div className="w-20 h-24 bg-gradient-to-t from-amber-700/30 to-transparent rounded-t-lg" />
          <div className="mt-2 text-2xl font-bold text-amber-700">3rd</div>
        </Card>
      </div>
    </div>
  );
}
