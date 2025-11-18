import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import AdminClans from '@/components/admin/AdminClans';
import AdminSports from '@/components/admin/AdminSports';
import AdminMatches from '@/components/admin/AdminMatches';
import AdminContent from '@/components/admin/AdminContent';
import AdminGallery from '@/components/admin/AdminGallery';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminClanMembers from '@/components/admin/AdminClanMembers';
import AdminTeamRosters from '@/components/admin/AdminTeamRosters';
import { AdminCSVImport } from '@/components/admin/AdminCSVImport';
import AdminSiteSettings from '@/components/admin/AdminSiteSettings';
import AdminClanPanchs from '@/components/admin/AdminClanPanchs';
import AdminSponsors from '@/components/admin/AdminSponsors';


const adminTabs = [
  { value: 'import', label: 'Import CSV' },
  { value: 'settings', label: 'Site Settings' },
  { value: 'clans', label: 'Clans' },
  { value: 'panchs', label: 'Panchs' },
  { value: 'members', label: 'Members' },
  { value: 'rosters', label: 'Rosters' },
  { value: 'sports', label: 'Sports' },
  { value: 'matches', label: 'Matches' },
  { value: 'content', label: 'Content' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'sponsors', label: 'Sponsors' },
  { value: 'admins', label: 'Admins' },
];

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('import');

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile Dropdown */}
            <div className="md:hidden mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {adminTabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Tabs */}
            <TabsList className="hidden md:flex w-full flex-wrap">
              {adminTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          
            <TabsContent value="import">
              <AdminCSVImport />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSiteSettings />
            </TabsContent>

            <TabsContent value="clans">
              <AdminClans />
            </TabsContent>

            <TabsContent value="panchs">
              <AdminClanPanchs />
            </TabsContent>
          
          <TabsContent value="members">
            <AdminClanMembers />
          </TabsContent>
          
          <TabsContent value="rosters">
            <AdminTeamRosters />
          </TabsContent>
          
          <TabsContent value="sports">
            <AdminSports />
          </TabsContent>
          
          <TabsContent value="matches">
            <AdminMatches />
          </TabsContent>
          
          <TabsContent value="content">
            <AdminContent />
          </TabsContent>

          <TabsContent value="gallery">
            <AdminGallery />
          </TabsContent>

          <TabsContent value="sponsors">
            <AdminSponsors />
          </TabsContent>

          <TabsContent value="admins">
            <AdminUsers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}