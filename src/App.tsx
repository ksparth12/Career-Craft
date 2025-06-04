import { Toaster } from "@/components/ui/toaster";
import "@/styles/gradients.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import RouteGuard from "./components/RouteGuard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Profile from "./pages/Profile";
import AboutPage from "./pages/AboutPage";
import SupabaseTest from "./components/debug/SupabaseTest";
import DirectLoginTest from "./components/debug/DirectLoginTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/dashboard" element={
                <RouteGuard>
                  <Dashboard />
                </RouteGuard>
              } />
              <Route path="/profile" element={
                <RouteGuard>
                  <Profile />
                </RouteGuard>
              } />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/debug" element={<SupabaseTest />} />
              <Route path="/direct-login-test" element={<DirectLoginTest />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
