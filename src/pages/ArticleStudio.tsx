
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PenTool, Sparkles, Target } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { UnifiedControlPanel } from '@/components/ArticleStudio/UnifiedControlPanel';
import { LivePreviewPanel } from '@/components/ArticleStudio/LivePreviewPanel';
import { useArticleStudio } from '@/hooks/useArticleStudio';
import { useIsMobile } from '@/hooks/use-mobile';

const ArticleStudio = () => {
  const articleStudio = useArticleStudio();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex items-center justify-center p-4 h-full">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl">
          <div className="text-6xl mb-4">💻</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Desktop Only
          </h2>
          <p className="text-gray-600 mb-6">
            Article Studio is optimized for desktop screens. Please use a desktop or laptop computer for the best experience.
          </p>
          <div className="text-sm text-gray-500">
            Minimum screen width: 768px
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white sticky top-0 z-50">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Article Studio
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-600" />
              <span>SEO Optimized</span>
            </div>
            <div className="flex items-center gap-1">
              <PenTool className="w-3 h-3 text-green-600" />
              <span>Real-time Preview</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="h-full overflow-auto">
              <UnifiedControlPanel {...articleStudio} />
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="opacity-0 hover:opacity-100 transition-opacity w-px bg-gray-200" />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full overflow-auto max-h-screen">
              <LivePreviewPanel {...articleStudio} updateArticleData={articleStudio.updateArticleData} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ArticleStudio;
