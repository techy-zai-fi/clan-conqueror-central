import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import AdminClans from '@/components/admin/AdminClans';
import AdminSports from '@/components/admin/AdminSports';
import AdminMatches from '@/components/admin/AdminMatches';
import AdminAnnouncements from '@/components/admin/AdminAnnouncements';
import AdminHighlights from '@/components/admin/AdminHighlights';

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Admin Dashboard
            </CardTitle>
            <CardDescription>
              Manage all aspects of the Clash of Clans championship
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="clans" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clans">Clans</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clans">
            <AdminClans />
          </TabsContent>
          
          <TabsContent value="sports">
            <AdminSports />
          </TabsContent>
          
          <TabsContent value="matches">
            <AdminMatches />
          </TabsContent>
          
          <TabsContent value="announcements">
            <AdminAnnouncements />
          </TabsContent>
          
          <TabsContent value="highlights">
            <AdminHighlights />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}