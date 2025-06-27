
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye, Sparkles } from 'lucide-react';

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
  const [displayContent, setDisplayContent] = useState('');
  const [showTypingCursor, setShowTypingCursor] = useState(false);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamingContent, isGenerating]);

  // Handle content updates with typing effect
  useEffect(() => {
    if (streamingContent) {
      setDisplayContent(streamingContent);
      setShowTypingCursor(isGenerating);
    } else if (content && !isGenerating) {
      setDisplayContent(content);
      setShowTypingCursor(false);
    }
  }, [streamingContent, content, isGenerating]);

  const formatContent = (rawContent: string) => {
    if (!rawContent) return '';
    
    return rawContent
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-gray-800 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-gray-700 mt-6">$1</h3>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')
      .replace(/\n/g, '<br>')
      .replace(/^([^<\n].*)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');
  };

  const getStatusIcon = () => {
    if (!isGenerating) return <Eye className="w-4 h-4" />;
    return <Loader2 className="w-4 h-4 animate-spin" />;
  };

  const getStatusColor = () => {
    if (!isGenerating) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const renderEmptyState = () => (
    <div className="text-center text-gray-500 py-16">
      <FileText className="w-20 h-20 mx-auto mb-6 opacity-20" />
      <h3 className="text-xl font-medium mb-2">No Title Selected</h3>
      <p className="text-gray-400">Choose or generate a title to start creating your streaming article</p>
    </div>
  );

  const renderInitialState = () => (
    <div className="text-center text-gray-500 py-16">
      <div className="mb-8">
        <Sparkles className="w-20 h-20 mx-auto mb-6 opacity-20 animate-pulse" />
        <h3 className="text-xl font-medium mb-2">Ready to Generate</h3>
        <p className="text-gray-400">Click "Generate Streaming Article" to watch your content build in real-time</p>
      </div>
    </div>
  );

  return (
    <Card className="h-full overflow-hidden border-2 border-gray-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Real-Time Streaming Preview
          {isGenerating && (
            <Badge 
              variant="secondary" 
              className={`ml-auto text-white animate-pulse ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span className="ml-1">Streaming...</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] overflow-auto p-0">
        <div ref={contentRef} className="h-full overflow-auto">
          <div className="p-6">
            {!title ? (
              renderEmptyState()
            ) : !displayContent && !isGenerating ? (
              renderInitialState()
            ) : (
              <div className="prose prose-lg max-w-none">
                {displayContent && (
                  <div 
                    className="text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
                  />
                )}
                
                {/* Typing cursor effect */}
                {showTypingCursor && (
                  <span className="inline-block w-0.5 h-5 bg-blue-600 animate-pulse ml-1"></span>
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
