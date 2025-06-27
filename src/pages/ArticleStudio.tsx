
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
import { SimplifiedUnifiedControlPanel } from '@/components/ArticleStudio/SimplifiedUnifiedControlPanel';
import { SimplifiedLivePreviewPanel } from '@/components/ArticleStudio/SimplifiedLivePreviewPanel';
import { useArticleStudio } from '@/hooks/useArticleStudio';
import { useIsMobile } from '@/hooks/use-mobile';

const ArticleStudio = () => {
  const articleStudio = useArticleStudio();
  const isMobile = useIsMobile();

  const handleGenerateContent = () => {
    // This will trigger the basic article generation
    // The enhanced generation will be handled by the ArticleEditorWithNovel component
    console.log('Generate content triggered');
  };

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
      {/* Header with SidebarTrigger and Breadcrumbs */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white">
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
              <span>Novel Editor</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Simplified Layout */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={35} minSize={30} maxSize={50}>
            <div className="h-full flex flex-col">
              <div className="py-3 px-4 border-b bg-gray-50/50">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <PenTool className="w-4 h-4 text-purple-600" />
                  Article Setup
                </h2>
              </div>
              <div className="flex-1 overflow-auto">
                <SimplifiedUnifiedControlPanel
                  articleData={articleStudio.articleData}
                  updateArticleData={articleStudio.updateArticleData}
                  onGenerateContent={handleGenerateContent}
                  isGenerating={articleStudio.isGenerating}
                />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors" />
          
          <ResizablePanel defaultSize={65} minSize={50}>
            <div className="h-full flex flex-col">
              <div className="py-3 px-4 border-b bg-gray-50/50">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Article Editor
                </h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <SimplifiedLivePreviewPanel
                  articleData={articleStudio.articleData}
                  streamingContent={articleStudio.streamingContent}
                  saveAndComplete={articleStudio.saveAndComplete}
                  isGenerating={articleStudio.isGenerating}
                  setStreamingContent={articleStudio.setStreamingContent}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ArticleStudio;
