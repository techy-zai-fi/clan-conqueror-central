import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  message: string;
  urgent: boolean;
  created_at: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      setAnnouncements(data || []);
    };

    fetchAnnouncements();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Megaphone className="h-10 w-10 text-accent" />
            Important <span className="text-accent">Announcements</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Stay updated with the latest news and updates
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {announcements.map((announcement, index) => (
            <Card
              key={announcement.id}
              className={`animate-slide-up ${
                announcement.urgent 
                  ? 'bg-gradient-to-br from-destructive/20 to-card border-destructive border-2' 
                  : 'bg-gradient-to-br from-card to-secondary/20'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {announcement.urgent ? (
                      <AlertCircle className="h-6 w-6 text-destructive mt-1" />
                    ) : (
                      <Megaphone className="h-6 w-6 text-primary mt-1" />
                    )}
                    <div>
                      <CardTitle className="text-2xl mb-2">{announcement.title}</CardTitle>
                      <p className="text-foreground leading-relaxed">{announcement.message}</p>
                    </div>
                  </div>
                  {announcement.urgent && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      URGENT
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(announcement.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {announcements.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Announcements Yet
              </h3>
              <p className="text-muted-foreground">
                Check back later for important updates
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
