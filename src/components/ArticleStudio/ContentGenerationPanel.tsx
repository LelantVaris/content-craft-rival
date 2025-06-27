
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PenTool, Zap, AlertCircle } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/prompt-kit/reasoning';
import { ResponseStream } from '@/components/prompt-kit/response-stream';

interface ContentGenerationPanelProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
  onComplete: () => Promise<void>;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setStreamingStatus: (status: string) => void;
}

export const ContentGenerationPanel: React.FC<ContentGenerationPanelProps> = ({
  articleData,
  onUpdate,
  onComplete,
  setStreamingContent,
  setIsGenerating,
  setStreamingStatus
}) => {
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [reasoningText, setReasoningText] = useState('');

  const canGenerate = () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    return title && articleData.outline.length > 0;
  };

  const handleGenerateContent = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!canGenerate()) {
      console.error('Please complete the title and outline first');
      return;
    }

    setIsGeneratingContent(true);
    setIsGenerating(true);
    setStreamingContent('');
    setGenerationError(null);
    setReasoningText('');
    setShowReasoning(true);

    try {
      // Start reasoning simulation
      setReasoningText('Analyzing your article requirements...');
      setStreamingStatus('Preparing to generate content...');
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      // Handle streaming response
      if (data && typeof data.getReader === 'function') {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                
                if (eventData.type === 'content') {
                  accumulatedContent = eventData.content;
                  setStreamingContent(accumulatedContent);
                  setReasoningText(`Writing section... ${accumulatedContent.length} characters generated`);
                } else if (eventData.type === 'complete') {
                  accumulatedContent = eventData.content;
                  setStreamingContent(accumulatedContent);
                  onUpdate({ generatedContent: accumulatedContent });
                  setReasoningText('Content generation complete!');
                  break;
                } else if (eventData.type === 'error') {
                  throw new Error(eventData.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const generatedContent = data?.content || '';
        if (generatedContent) {
          onUpdate({ generatedContent });
          setStreamingContent(generatedContent);
          setReasoningText('Content generation complete!');
        } else {
          throw new Error('No content was generated');
        }
      }
      
      console.log('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      console.error(`Failed to generate content: ${errorMessage}`);
      setStreamingContent('');
      setReasoningText(`Error: ${errorMessage}`);
    } finally {
      setIsGeneratingContent(false);
      setIsGenerating(false);
      
      // Auto-hide reasoning after completion
      setTimeout(() => {
        setShowReasoning(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="w-5 h-5 text-green-600" />
            Generate Article Content  
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Ready to generate your article content using AI with real-time streaming.
          </p>

          {/* AI Reasoning Panel */}
          <Reasoning 
            isStreaming={isGeneratingContent}
            open={showReasoning}
            onOpenChange={setShowReasoning}
          >
            <ReasoningTrigger>Show AI reasoning process</ReasoningTrigger>
            <ReasoningContent 
              className="ml-2 border-l-2 border-l-green-200 px-3 py-2 bg-green-50 rounded-r-lg"
              markdown={false}
            >
              <ResponseStream
                textStream={reasoningText}
                mode="typewriter"
                className="text-sm text-green-800"
              />
            </ReasoningContent>
          </Reasoning>

          {generationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation Failed</p>
                <p className="text-xs text-red-600 mt-1">{generationError}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerateContent}
            disabled={isGeneratingContent || !canGenerate()}
            className="w-full"
          >
            {isGeneratingContent ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {!canGenerate() && (
            <p className="text-xs text-gray-500 text-center">
              Complete title and outline steps to enable content generation
            </p>
          )}
        </CardContent>
      </Card>

      {articleData.generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="w-5 h-5 text-green-600" />
              Ready to Create
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your article content has been generated! Click "Create Article" to save it and continue editing.
            </p>
            <Button
              onClick={onComplete}
              disabled={isGeneratingContent}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
