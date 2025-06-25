
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebsiteProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Routes>
                        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                        <Route path="/article/new" element={<ProtectedRoute><ArticleStudio /></ProtectedRoute>} />
                        <Route path="/article/studio" element={<ProtectedRoute><ArticleStudio /></ProtectedRoute>} />
                        <Route path="/article/:id/edit" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
                        <Route path="/article/editor" element={<ProtectedRoute><ArticleEditorRoute /></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </SidebarInset>
                  </SidebarProvider>
                } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WebsiteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
