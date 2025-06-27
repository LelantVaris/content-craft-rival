
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye, Search, Sparkles } from 'lucide-react';
import { StreamingSkeleton } from './StreamingSkeleton';

interface StreamingArticlePreviewProps {
  title: string;
  content: string;
  isGenerating: boolean;
  streamingContent?: string;
  streamingStatus?: {
    phase: 'draft' | 'research' | 'enhancing' | 'writing' | 'complete';
    message: string;
    progress: number;
    currentSection?: string;
  };
}

export const StreamingArticlePreview: React.FC<StreamingArticlePreviewProps> = ({
  title,
  content,
  isGenerating,
  streamingContent,
  streamingStatus
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [researchQueries, setResearchQueries] = useState<string[]>([]);

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
      .replace(/\n/g, '<br>')
      .replace(/^([^<\n].*)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');
  };

  const displayContent = streamingContent || content;

  const getStatusIcon = () => {
    if (!streamingStatus) return <Loader2 className="w-4 h-4 animate-spin" />;
    
    switch (streamingStatus.phase) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'research': return <Search className="w-4 h-4 animate-pulse" />;
      case 'enhancing': return <Sparkles className="w-4 h-4 animate-pulse" />;
      case 'writing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete': return <Eye className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    if (!streamingStatus) return 'bg-blue-500';
    
    switch (streamingStatus.phase) {
      case 'draft': return 'bg-purple-500';
      case 'research': return 'bg-amber-500';
      case 'enhancing': return 'bg-green-500';
      case 'writing': return 'bg-blue-500';
      case 'complete': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full overflow-hidden border-2 border-gray-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Enhanced Live Preview
          {isGenerating && streamingStatus && (
            <Badge 
              variant="secondary" 
              className={`ml-auto text-white animate-pulse ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span className="ml-1">{streamingStatus.message}</span>
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
                    <p className="text-lg">Ready to generate your enhanced article</p>
                    <p className="text-sm mt-2">AI will research and optimize each section in real-time</p>
                  </div>
                )}
                
                {/* Show streaming skeleton during generation */}
                {isGenerating && streamingStatus && (
                  <StreamingSkeleton
                    phase={streamingStatus.phase}
                    currentSection={streamingStatus.currentSection}
                    progress={streamingStatus.progress}
                    message={streamingStatus.message}
                  />
                )}

                {/* Show research queries if available */}
                {researchQueries.length > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Current Research Queries
                    </h4>
                    <div className="space-y-1">
                      {researchQueries.map((query, index) => (
                        <div key={index} className="text-sm text-amber-700 bg-amber-100 px-2 py-1 rounded">
                          {query}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isGenerating && !streamingStatus && (
                  <div className="flex items-center gap-2 mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-blue-800 text-sm">
                      Initializing enhanced AI generation with research...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                <FileText className="w-20 h-20 mx-auto mb-6 opacity-20" />
                <h3 className="text-xl font-medium mb-2">No Title Selected</h3>
                <p className="text-gray-400">Choose or generate a title to start creating your research-enhanced article</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
