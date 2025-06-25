
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, Sparkles, Target } from 'lucide-react';
import { ControlPanel } from '@/components/ArticleStudio/ControlPanel';
import { PreviewPanel } from '@/components/ArticleStudio/PreviewPanel';
import { useArticleStudio } from '@/hooks/useArticleStudio';

const ArticleStudio = () => {
  const articleStudio = useArticleStudio();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="p-6 pb-2">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Article Studio
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create engaging, SEO-optimized content with real-time AI assistance
          </p>
          
          <div className="flex justify-center gap-8 mt-4">
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

      <div className="px-6 pb-6 h-[calc(100vh-200px)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <Card className="h-full border-0 bg-white/80 backdrop-blur shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  Control Panel
                </CardTitle>
                <CardDescription>
                  Guide your article creation process
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-auto">
                <ControlPanel {...articleStudio} />
              </CardContent>
            </Card>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            <Card className="h-full border-0 bg-white/80 backdrop-blur shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Watch your article come to life
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-auto">
                <PreviewPanel {...articleStudio} />
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ArticleStudio;
