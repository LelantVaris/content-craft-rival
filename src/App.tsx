
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import ArticleForm from "./pages/ArticleForm";
import ArticleEditor from "./pages/ArticleEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <div className="p-2">
                <SidebarTrigger />
              </div>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/article/new" element={<ArticleForm />} />
                <Route path="/article/editor" element={<ArticleEditor />} />
                {/* Placeholder routes for sidebar navigation */}
                <Route path="/articles" element={<div className="p-6"><h1 className="text-2xl font-bold">Articles</h1><p>Article management coming soon...</p></div>} />
                <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Analytics dashboard coming soon...</p></div>} />
                <Route path="/keywords" element={<div className="p-6"><h1 className="text-2xl font-bold">Keyword Research</h1><p>Keyword research tools coming soon...</p></div>} />
                <Route path="/competitors" element={<div className="p-6"><h1 className="text-2xl font-bold">Competitors</h1><p>Competitor analysis coming soon...</p></div>} />
                <Route path="/team" element={<div className="p-6"><h1 className="text-2xl font-bold">Team</h1><p>Team management coming soon...</p></div>} />
                <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings panel coming soon...</p></div>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
