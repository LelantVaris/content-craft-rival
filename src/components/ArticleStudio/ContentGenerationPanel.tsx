
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
  getPrimaryKeyword: () => string;
  getSecondaryKeywords: () => string[];
  getTargetWordCount: () => number;
}

export const ContentGenerationPanel: React.FC<ContentGenerationPanelProps> = ({
  articleData,
  onUpdate,
  onComplete,
  setStreamingContent,
  setIsGenerating,
  setStreamingStatus,
  getPrimaryKeyword,
  getSecondaryKeywords,
  getTargetWordCount
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
      setReasoningText('Analyzing your PVOD article requirements...');
      setStreamingStatus('Preparing to generate PVOD content...');
      
      console.log('Invoking generate-content-ai-sdk function...');
      const { data, error } = await supabase.functions.invoke('generate-content-ai-sdk', {
        body: {
          title,
          outline: articleData.outline,
          keywords: articleData.keywords,
          primaryKeyword: getPrimaryKeyword(),
          audience: articleData.audience,
          tone: articleData.tone,
          targetWordCount: getTargetWordCount(),
          searchIntent: articleData.searchIntent,
          brand: articleData.brand,
          product: articleData.product,
          pointOfView: articleData.pointOfView
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      console.log('Function response received:', { hasContent: !!data?.content });

      if (data?.content) {
        onUpdate({ generatedContent: data.content });
        setStreamingContent(data.content);
        setReasoningText('PVOD content generation complete!');
        setStreamingStatus('Ready to create article');
        console.log('Content generated successfully with', data.metadata?.wordCount || 0, 'words');
      } else {
        throw new Error('No content was generated');
      }
      
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
            Generate PVOD Article Content  
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Ready to generate your article content using PVOD principles (Personality, Value, Opinion, Direct).
          </p>

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
                Generating PVOD Content...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate PVOD Content
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
              Your PVOD article content has been generated! Click "Create Article" to save it and continue editing.
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
