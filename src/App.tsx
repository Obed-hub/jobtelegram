import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { BottomNav } from "@/components/BottomNav";
import DiscoverPage from "@/pages/DiscoverPage";
import ProfilePage from "@/pages/ProfilePage";
import SavedPage from "@/pages/SavedPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import FreelanceNetworksPage from "@/pages/FreelanceNetworksPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppProvider>
          <div className="min-h-screen bg-background max-w-lg mx-auto relative">
            <Routes>
              <Route path="/" element={<DiscoverPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/job/:id" element={<JobDetailsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/networks" element={<FreelanceNetworksPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
