import { AlertCircle, Megaphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { announcements } from '@/data/mockData';

export default function AnnouncementsBanner() {
  const urgentAnnouncement = announcements.find(a => a.urgent);
  
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
