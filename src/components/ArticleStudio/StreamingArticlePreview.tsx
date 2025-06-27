
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionSkeleton } from './SectionSkeleton';

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
  const [showBasicArticle, setShowBasicArticle] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [sectionProgress, setSectionProgress] = useState<number>(0);
  const [sourcesFound, setSourcesFound] = useState<number>(0);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamingContent, isGenerating]);

  // Detect current phase from streaming status and manage state
  useEffect(() => {
    if (streamingStatus) {
      if (streamingStatus.includes('Phase 1')) {
        setCurrentPhase('basic');
        setShowBasicArticle(false);
      } else if (streamingStatus.includes('Phase 2') || streamingStatus.includes('Researching:')) {
        setCurrentPhase('research');
        setShowBasicArticle(true);
        
        if (streamingStatus.includes('Researching:')) {
          const sectionMatch = streamingStatus.match(/Researching: (.+)/);
          if (sectionMatch) {
            setCurrentSection(sectionMatch[1]);
          }
        }
      } else if (streamingStatus.includes('Enhancing:')) {
        setCurrentPhase('enhancement');
        setShowBasicArticle(true);
        
        const sectionMatch = streamingStatus.match(/Enhancing: (.+?) \((\d+) sources/);
        if (sectionMatch) {
          setCurrentSection(sectionMatch[1]);
          setSourcesFound(parseInt(sectionMatch[2]) || 0);
        }
      } else if (streamingStatus.includes('Enhanced:')) {
        const sectionMatch = streamingStatus.match(/Enhanced: (.+)/);
        if (sectionMatch) {
          setCurrentSection('');
        }
      }
    }
  }, [streamingStatus]);

  const formatContent = (rawContent: string) => {
    if (!rawContent) return '';
    
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
    return <Loader2 className="w-4 h-4 animate-spin" />;
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

  const renderPhase1Loading = () => (
    <div className="text-center text-gray-500 py-16">
      <div className="mb-8">
        <FileText className="w-20 h-20 mx-auto mb-6 opacity-20 animate-pulse" />
        <h3 className="text-xl font-medium mb-2">Generating Article Foundation</h3>
        <p className="text-gray-400">Creating the structure for your research-enhanced article...</p>
      </div>
      
      <div className="space-y-4 max-w-md mx-auto">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
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
                {currentPhase === 'basic' && 'Generating Foundation'}
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
                
                {/* Phase 1: Show loading state only */}
                {isGenerating && currentPhase === 'basic' && !showBasicArticle && renderPhase1Loading()}
                
                {/* Phase 2+: Show content */}
                {(showBasicArticle || !isGenerating) && displayContent && (
                  <div 
                    className="text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
                  />
                )}
                
                {/* Show section enhancement in progress */}
                {isGenerating && currentPhase !== 'basic' && currentSection && (
                  <SectionSkeleton
                    title={currentSection}
                    phase={currentPhase === 'research' ? 'researching' : 'enhancing'}
                    progress={sectionProgress}
                    sources={sourcesFound}
                  />
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
