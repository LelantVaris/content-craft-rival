
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye } from 'lucide-react';

interface StreamingArticlePreviewProps {
  title: string;
  content: string;
  isGenerating: boolean;
  streamingContent?: string;
}

export const StreamingArticlePreview: React.FC<StreamingArticlePreviewProps> = ({
  title,
  content,
  isGenerating,
  streamingContent
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamingContent, isGenerating]);

  const formatContent = (rawContent: string) => {
    if (!rawContent) return '';
    
    // Enhanced markdown-like formatting
    return rawContent
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 text-gray-800 mt-8">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 text-gray-700 mt-6">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')
      .replace(/\n/g, '<br>');
  };

  const displayContent = streamingContent || content;

  return (
    <Card className="h-full overflow-hidden border-2 border-gray-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Live Preview
          {isGenerating && (
            <Badge variant="secondary" className="ml-auto animate-pulse">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] overflow-auto p-0">
        <div ref={contentRef} className="h-full overflow-auto">
          <div className="p-6">
            {title ? (
              <div className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-8 text-gray-900 border-b-2 border-purple-200 pb-4">
                  {title}
                </h1>
                
                {displayContent ? (
                  <div 
                    className="text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Ready to generate your article content</p>
                    <p className="text-sm mt-2">Content will appear here in real-time as it's generated</p>
                  </div>
                )}
                
                {isGenerating && (
                  <div className="flex items-center gap-2 mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-blue-800 text-sm">
                      AI is writing your content... New sections will appear here as they're completed.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                <FileText className="w-20 h-20 mx-auto mb-6 opacity-20" />
                <h3 className="text-xl font-medium mb-2">No Title Selected</h3>
                <p className="text-gray-400">Choose or generate a title to start previewing your article</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
