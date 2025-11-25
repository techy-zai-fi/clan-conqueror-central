import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Clans from "./pages/Clans";
import ClanDetail from "./pages/ClanDetail";
import Sports from "./pages/Sports";
import SportStandings from "./pages/SportStandings";
import SportSchedule from "./pages/SportSchedule";
import Leaderboard from "./pages/Leaderboard";
import Schedule from "./pages/Schedule";
import Announcements from "./pages/Announcements";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Install from "./pages/Install";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clans" element={<Clans />} />
          <Route path="/clans/:id" element={<ClanDetail />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/:sportId/standings" element={<SportStandings />} />
          <Route path="/sports/:sportId/schedule" element={<SportSchedule />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/install" element={<Install />} />
          <Route path="/gallery" element={<Gallery />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
