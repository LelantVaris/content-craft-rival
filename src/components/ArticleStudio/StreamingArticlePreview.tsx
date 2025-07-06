
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye } from 'lucide-react';
import { ResponseStream } from '@/components/prompt-kit/response-stream';
import { Markdown } from '@/components/prompt-kit/markdown';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/prompt-kit/reasoning';

interface StreamingArticlePreviewProps {
  title: string;
  content: string;
  isGenerating: boolean;
  streamingContent?: string;
  streamingStatus?: string | null;
  outline?: any[];
  useEnhancedGeneration?: boolean;
  enhancedGeneration?: any;
}

export const StreamingArticlePreview: React.FC<StreamingArticlePreviewProps> = ({
  title,
  content,
  isGenerating,
  streamingContent,
  streamingStatus,
  outline = [],
  useEnhancedGeneration = false,
  enhancedGeneration
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (contentRef.current && (isGenerating || enhancedGeneration?.isGenerating)) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamingContent, isGenerating, enhancedGeneration?.finalContent, enhancedGeneration?.isGenerating]);

  const displayContent = streamingContent || enhancedGeneration?.finalContent || content || '';
  const safeStreamingStatus = streamingStatus ? String(streamingStatus) : '';

  const isEnhancedGenerating = enhancedGeneration?.isGenerating || false;
  const currentMessage = enhancedGeneration?.currentMessage || '';
  const progress = enhancedGeneration?.progress || {};

  return (
    <Card className="h-full overflow-hidden border-2 border-gray-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Live Article Preview
          {(isGenerating || isEnhancedGenerating) && (
            <Badge 
              variant="secondary" 
              className="ml-auto text-white animate-pulse bg-blue-500"
            >
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              {progress.wordsGenerated > 0 
                ? `${progress.wordsGenerated}/${progress.targetWords} words`
                : 'Generating...'
              }
            </Badge>
          )}
        </CardTitle>
        
        {/* Enhanced AI Reasoning Panel */}
        {(isGenerating || isEnhancedGenerating) && (safeStreamingStatus || currentMessage) && (
          <Reasoning 
            isStreaming={isGenerating || isEnhancedGenerating}
            open={showReasoning}
            onOpenChange={setShowReasoning}
          >
            <ReasoningTrigger>Show AI reasoning</ReasoningTrigger>
            <ReasoningContent className="ml-2 border-l-2 border-l-blue-200 px-2 pb-1">
              <div className="space-y-2">
                <ResponseStream 
                  textStream={currentMessage || safeStreamingStatus}
                  mode="typewriter"
                  className="text-sm text-blue-800"
                />
                {progress.wordsGenerated > 0 && (
                  <div className="text-xs text-blue-600">
                    Section {progress.currentSection}/{progress.totalSections} • 
                    {Math.round((progress.wordsGenerated / progress.targetWords) * 100)}% complete
                  </div>
                )}
              </div>
            </ReasoningContent>
          </Reasoning>
        )}
      </CardHeader>
      
      <CardContent className="h-[calc(100%-120px)] overflow-auto p-0">
        <div ref={contentRef} className="h-full overflow-auto">
          <div className="p-6">
            {title ? (
              <div className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-8 text-gray-900 border-b-2 border-purple-200 pb-4">
                  {title}
                </h1>
                
                {displayContent ? (
                  (isGenerating || isEnhancedGenerating) ? (
                    <ResponseStream
                      textStream={displayContent}
                      mode="typewriter"
                      className="text-gray-700 leading-relaxed"
                      segmentDelay={20}
                    />
                  ) : (
                    <Markdown className="text-gray-700 leading-relaxed">
                      {displayContent}
                    </Markdown>
                  )
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Ready to generate your article</p>
                    <p className="text-sm mt-2">Content will stream here in real-time</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                <FileText className="w-20 h-20 mx-auto mb-6 opacity-20" />
                <h3 className="text-xl font-medium mb-2">No Title Selected</h3>
                <p className="text-gray-400">Choose or generate a title to start creating your article</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
