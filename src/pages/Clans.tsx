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

interface ClanMember {
  id: string;
  name: string;
  profile_image: string | null;
}

export default function Clans() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [clanMembers, setClanMembers] = useState<{ [clanId: string]: ClanMember[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('*')
      .order('rank', { ascending: true, nullsFirst: false });
    
    if (data) {
      setClans(data);
      // Fetch members for each clan
      data.forEach(clan => fetchClanMembers(clan.id));
    }
    setLoading(false);
  };

  const fetchClanMembers = async (clanId: string) => {
    const { data } = await supabase
      .from('clan_members')
      .select('id, name, profile_image')
      .eq('clan_id', clanId);
    
    if (data) {
      setClanMembers(prev => ({ ...prev, [clanId]: data }));
    }
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
              <Link key={clan.id} to={`/clans/${clan.id}`}>
                <Card 
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
                  <div className="text-7xl mb-4">
                    {clan.logo.startsWith('http') ? (
                      <img src={clan.logo} alt={clan.name} className="h-20 w-20 object-contain mx-auto" />
                    ) : (
                      clan.logo
                    )}
                  </div>
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

                  <div className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5" style={{ color: clan.color }} />
                      <span className="font-medium">Team Members</span>
                    </div>
                    {clanMembers[clan.id] && clanMembers[clan.id].length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {clanMembers[clan.id].slice(0, 6).map((member) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm">
                            {member.profile_image ? (
                              <img 
                                src={member.profile_image} 
                                alt={member.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-muted-foreground truncate">{member.name}</span>
                          </div>
                        ))}
                        {clanMembers[clan.id].length > 6 && (
                          <span className="text-xs text-muted-foreground col-span-2">
                            +{clanMembers[clan.id].length - 6} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No members yet</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}