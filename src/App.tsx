import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Laboratories from "./pages/Laboratories";
import Pages from "./pages/Pages";
import PageCreate from "./pages/PageCreate";
import PageEdit from "./pages/PageEdit";
import Banners from "./pages/Banners";
import BannerCreate from "./pages/BannerCreate";
import BannerEdit from "./pages/BannerEdit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="requests" element={<Requests />} />
              <Route path="patients" element={<Patients />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="laboratories" element={<Laboratories />} />
              <Route path="pages" element={<Pages />} />
              <Route path="pages/new" element={<PageCreate />} />
              <Route path="pages/:id" element={<PageEdit />} />
              <Route path="banners" element={<Banners />} />
              <Route path="banners/new" element={<BannerCreate />} />
              <Route path="banners/:id" element={<BannerEdit />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
