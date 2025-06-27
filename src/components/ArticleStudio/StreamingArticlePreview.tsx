
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye, Search, Sparkles, Brain } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StreamingArticlePreviewProps {
  title: string;
  content: string;
  isGenerating: boolean;
  streamingContent?: string;
  streamingStatus?: string;
}

export const StreamingArticlePreview: React.FC<StreamingArticlePreviewProps> = ({
  title,
  content,
  isGenerating,
  streamingContent,
  streamingStatus
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPhase, setCurrentPhase] = useState<'basic' | 'research' | 'enhancement'>('basic');

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamingContent, isGenerating]);

  // Detect current phase from streaming status
  useEffect(() => {
    if (streamingStatus) {
      if (streamingStatus.includes('Phase 1')) {
        setCurrentPhase('basic');
      } else if (streamingStatus.includes('Researching')) {
        setCurrentPhase('research');
      } else if (streamingStatus.includes('Enhancing') || streamingStatus.includes('Enhanced')) {
        setCurrentPhase('enhancement');
      }
    }
  }, [streamingStatus]);

  const formatContent = (rawContent: string) => {
    if (!rawContent) return '';
    
    // Enhanced markdown-like formatting
    return rawContent
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-gray-800 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-gray-700 mt-6">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')
      .replace(/\n/g, '<br>')
      .replace(/^([^<\n].*)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');
  };

  const displayContent = streamingContent || content;

  const getStatusIcon = () => {
    if (!isGenerating) return <Eye className="w-4 h-4" />;
    
    switch (currentPhase) {
      case 'basic': return <FileText className="w-4 h-4 animate-pulse" />;
      case 'research': return <Search className="w-4 h-4 animate-pulse" />;
      case 'enhancement': return <Brain className="w-4 h-4 animate-pulse" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    if (!isGenerating) return 'bg-green-500';
    
    switch (currentPhase) {
      case 'basic': return 'bg-blue-500';
      case 'research': return 'bg-amber-500';
      case 'enhancement': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const renderSectionSkeleton = (sectionTitle: string, isEnhancing: boolean = false) => (
    <div className="my-6 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        {isEnhancing ? (
          <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
        ) : (
          <Search className="w-5 h-5 text-amber-600 animate-pulse" />
        )}
        <h3 className="text-lg font-semibold text-gray-800">{sectionTitle}</h3>
        <Badge variant="secondary" className={`ml-auto ${isEnhancing ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
          {isEnhancing ? 'Enhancing...' : 'Researching...'}
        </Badge>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="h-full overflow-hidden border-2 border-gray-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Research-Enhanced Live Preview
          {isGenerating && (
            <Badge 
              variant="secondary" 
              className={`ml-auto text-white animate-pulse ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span className="ml-1">
                {currentPhase === 'basic' && 'Generating Article'}
                {currentPhase === 'research' && 'Researching Sections'}
                {currentPhase === 'enhancement' && 'Enhancing Content'}
              </span>
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
                    <p className="text-lg">Ready to generate your research-enhanced article</p>
                    <p className="text-sm mt-2">Two-phase generation: Basic article + Section research enhancement</p>
                  </div>
                )}
                
                {/* Show section skeletons during research/enhancement phase */}
                {isGenerating && currentPhase !== 'basic' && (
                  <div className="mt-8 space-y-4">
                    {renderSectionSkeleton("Upcoming Section", currentPhase === 'enhancement')}
                  </div>
                )}

                {/* Show current status */}
                {isGenerating && streamingStatus && (
                  <div className="flex items-center gap-2 mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-blue-800 text-sm">
                      {streamingStatus}
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
