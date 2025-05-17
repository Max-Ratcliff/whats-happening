
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ExplorePage from "./pages/ExplorePage";
import MyClubsPage from "./pages/MyClubsPage";
import ClubProfilePage from "./pages/ClubProfilePage";
import CalendarPage from "./pages/CalendarPage";
import OfficerPortalPage from "./pages/OfficerPortalPage";
import OfficerPortalProfile from "./pages/OfficerPortalProfile";
import OfficerPortalCreatePost from "./pages/OfficerPortalCreatePost";
import OfficerPortalEvents from "./pages/OfficerPortalEvents";
import OfficerPortalMembers from "./pages/OfficerPortalMembers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Main Application Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/my-clubs" element={<MyClubsPage />} />
          <Route path="/clubs/:id" element={<ClubProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          
          {/* Officer Portal Routes */}
          <Route path="/officer/:clubId" element={<OfficerPortalPage />}>
            <Route path="profile" element={<OfficerPortalProfile />} />
            <Route path="post" element={<OfficerPortalCreatePost />} />
            <Route path="events" element={<OfficerPortalEvents />} />
            <Route path="members" element={<OfficerPortalMembers />} />
          </Route>
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
