
import ArticlesDashboard from "@/components/ArticlesDashboard"
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { FileText, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white sticky top-0 z-50">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-600" />
              <span>Content Hub</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-600" />
              <span>Team Workspace</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <ArticlesDashboard />
      </div>
    </div>
  )
}

export default Index
