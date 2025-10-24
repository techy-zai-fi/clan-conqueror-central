import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import sponsor1 from '@/assets/sponsor-placeholder-1.jpg';
import sponsor2 from '@/assets/sponsor-placeholder-2.jpg';
import sponsor3 from '@/assets/sponsor-placeholder-3.jpg';
import sponsor4 from '@/assets/sponsor-placeholder-4.jpg';
import sponsor5 from '@/assets/sponsor-placeholder-5.jpg';

interface Sponsor {
  id: string;
  name: string;
  image_url: string;
  website_url: string | null;
}

const placeholderSponsors = [
  { id: '1', name: 'Sponsor 1', image_url: sponsor1, website_url: null },
  { id: '2', name: 'Sponsor 2', image_url: sponsor2, website_url: null },
  { id: '3', name: 'Sponsor 3', image_url: sponsor3, website_url: null },
  { id: '4', name: 'Sponsor 4', image_url: sponsor4, website_url: null },
  { id: '5', name: 'Sponsor 5', image_url: sponsor5, website_url: null },
];

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(placeholderSponsors);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      setSponsors(data);
    }
  };

  return (
    <section className="py-12">
      <Card className="bg-gradient-to-br from-card to-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="h-6 w-6 text-accent" />
            Our Sponsors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex items-center justify-center p-6 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all hover:scale-105 cursor-pointer"
                onClick={() => sponsor.website_url && window.open(sponsor.website_url, '_blank')}
              >
                <img
                  src={sponsor.image_url}
                  alt={sponsor.name}
                  className="w-full h-24 object-contain filter hover:grayscale-0 grayscale transition-all"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
