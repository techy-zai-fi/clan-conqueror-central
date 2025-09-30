import { AlertCircle, Megaphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  message: string;
  urgent: boolean;
  created_at: string;
}

export default function AnnouncementsBanner() {
  const [urgentAnnouncement, setUrgentAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchUrgentAnnouncement = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('urgent', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching announcement:', error);
        return;
      }

      setUrgentAnnouncement(data);
    };

    fetchUrgentAnnouncement();
  }, []);
  
  if (!urgentAnnouncement) return null;

  return (
    <Alert variant="destructive" className="animate-slide-up border-2">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2">
        <Megaphone className="h-4 w-4" />
        Important Announcement
      </AlertTitle>
      <AlertDescription>
        <strong>{urgentAnnouncement.title}:</strong> {urgentAnnouncement.message}
      </AlertDescription>
    </Alert>
  );
}
