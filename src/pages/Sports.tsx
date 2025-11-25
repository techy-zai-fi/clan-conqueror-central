import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function Sports() {
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    const fetchSports = async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching sports:', error);
        return;
      }

      setSports(data || []);
    };

    fetchSports();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Competition <span className="text-accent">Sports</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Excellence across multiple disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {sports.map((sport, index) => (
            <Card 
              key={sport.id}
              className="h-full hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in bg-gradient-to-br from-card to-secondary/20 border-2 border-border hover:border-primary/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4 md:pb-6 p-4 md:p-6">
                <div className="text-5xl md:text-8xl mb-2 md:mb-4">{sport.icon}</div>
                <CardTitle className="text-xl md:text-3xl">{sport.name}</CardTitle>
                <p className="text-sm md:text-base text-muted-foreground italic mt-1 md:mt-2">{sport.description}</p>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 pt-0 space-y-2">
                <Link to={`/sports/${sport.id}/standings`}>
                  <Button className="w-full group text-sm md:text-base" variant="default">
                    <span>View Standings</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={`/sports/${sport.id}/schedule`}>
                  <Button className="w-full group text-sm md:text-base" variant="outline">
                    <span>View Schedule and Results</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Sports Coming Soon */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-secondary/30 to-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">More Sports Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Badminton, Table Tennis, Athletics, and Chess competitions will be added soon. 
                Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
