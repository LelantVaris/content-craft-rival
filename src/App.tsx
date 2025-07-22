
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WebsiteProvider } from "./contexts/WebsiteContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import ArticleStudio from "./pages/ArticleStudio";
import ArticleEditor from "./pages/ArticleEditor";
import ArticleEditorRoute from "./pages/ArticleEditorRoute";
import Calendar from "./pages/Calendar";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import CrawlerTest from "./pages/CrawlerTest";
import NovelEditorTest from "./pages/NovelEditorTest";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AiTest } from "./components/AiTest";
import "./App.css";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  
  // Determine if sidebar should be collapsed by default based on route
  const isArticleStudio = location.pathname === '/article/new' || location.pathname === '/article/studio';
  const sidebarDefaultOpen = !isArticleStudio;

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/article/new" element={<ProtectedRoute><ArticleStudio /></ProtectedRoute>} />
            <Route path="/article/studio" element={<ProtectedRoute><ArticleStudio /></ProtectedRoute>} />
            <Route path="/article/:id/edit" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
            <Route path="/article/editor" element={<ProtectedRoute><ArticleEditorRoute /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/crawler-test" element={<ProtectedRoute><CrawlerTest /></ProtectedRoute>} />
            <Route path="/novel-editor-test" element={<ProtectedRoute><NovelEditorTest /></ProtectedRoute>} />
            <Route path="/ai-test" element={<ProtectedRoute><AiTest /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <div className="min-h-screen w-full">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebsiteProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/*" element={<AppContent />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WebsiteProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
