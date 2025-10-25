import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Clan {
  id: string;
  name: string;
  color: string;
  sub_color: string | null;
  tagline: string;
  mascot: string;
  logo: string;
  bg_image: string | null;
  video_url: string | null;
  total_points: number;
}

interface Panch {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  display_order: number;
}

export default function ClanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clan, setClan] = useState<Clan | null>(null);
  const [panchs, setPanchs] = useState<Panch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClanData();
  }, [id]);

  const fetchClanData = async () => {
    try {
      const [clanRes, panchsRes] = await Promise.all([
        supabase.from('clans').select('*').eq('id', id).single(),
        supabase.from('clan_panchs').select('*').eq('clan_id', id).order('display_order'),
      ]);

      if (clanRes.data) setClan(clanRes.data);
      if (panchsRes.data) setPanchs(panchsRes.data);
    } catch (error) {
      console.error('Error fetching clan data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Clan not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: clan.sub_color || clan.color }}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/clans')}
          className="mb-6"
          style={{ 
            borderColor: clan.color,
            color: clan.color,
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clans
        </Button>

        {/* Hero Section */}
        <div 
          className="relative rounded-2xl overflow-hidden mb-8 p-8 md:p-16 text-white"
          style={{
            backgroundColor: clan.color,
            backgroundImage: clan.bg_image ? `url(${clan.bg_image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 text-center">
            <img 
              src={clan.logo} 
              alt={clan.name}
              className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 object-contain drop-shadow-2xl"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{clan.name}</h1>
            <p className="text-xl md:text-2xl mb-4 drop-shadow-lg">{clan.tagline}</p>
            <p className="text-lg drop-shadow-lg">Mascot: {clan.mascot}</p>
            <div className="mt-6">
              <span className="text-3xl font-bold drop-shadow-lg">Total Points: {clan.total_points}</span>
            </div>
          </div>
        </div>

        {/* Intro Video Section */}
        {clan.video_url && (
          <Card className="mb-8" style={{ borderColor: clan.color }}>
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: clan.color }}>
                Clan Introduction
              </h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={clan.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${clan.name} Introduction Video`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panchs Section */}
        {panchs.length > 0 && (
          <Card style={{ borderColor: clan.color }}>
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: clan.color }}>
                Clan Leaders (Panchs)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {panchs.map((panch) => (
                  <Card 
                    key={panch.id}
                    className="text-center hover:shadow-lg transition-shadow"
                    style={{ borderColor: clan.color }}
                  >
                    <CardContent className="p-6">
                      {panch.image_url ? (
                        <img
                          src={panch.image_url}
                          alt={panch.name}
                          className="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
                          style={{ border: `3px solid ${clan.color}` }}
                        />
                      ) : (
                        <div 
                          className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                          style={{ backgroundColor: clan.color }}
                        >
                          {panch.name.charAt(0)}
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-1">{panch.name}</h3>
                      <p className="text-sm text-muted-foreground">{panch.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
