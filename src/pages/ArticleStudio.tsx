
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PenTool, Sparkles, Target, Monitor } from 'lucide-react';
import { ControlPanel } from '@/components/ArticleStudio/ControlPanel';
import { PreviewPanel } from '@/components/ArticleStudio/PreviewPanel';
import { useArticleStudio } from '@/hooks/useArticleStudio';
import { useIsMobile } from '@/hooks/use-mobile';

const ArticleStudio = () => {
  const articleStudio = useArticleStudio();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
    <div className="h-screen bg-white">
      <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-6 py-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Article Studio
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              Create engaging, SEO-optimized content with real-time AI assistance
            </p>
            
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">SEO Optimized</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <PenTool className="w-4 h-4" />
                <span className="text-sm font-medium">Real-time Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b bg-gray-50/50">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  Control Panel
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Guide your article creation process
                </p>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <ControlPanel {...articleStudio} />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors" />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b bg-gray-50/50">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Live Preview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Watch your article come to life
                </p>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <PreviewPanel {...articleStudio} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ArticleStudio;
