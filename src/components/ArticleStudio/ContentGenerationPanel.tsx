
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PenTool, Zap, AlertCircle } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/prompt-kit/reasoning';
import { ResponseStream } from '@/components/prompt-kit/response-stream';
import { useEnhancedContentGeneration } from '@/hooks/useEnhancedContentGeneration';

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
  const [showReasoning, setShowReasoning] = useState(false);
  
  const {
    generateContent,
    isGenerating: isEnhancedGenerating,
    sections,
    overallProgress,
    currentMessage,
    error: enhancedError,
    finalContent,
    reset
  } = useEnhancedContentGeneration();

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

    // Reset previous state
    reset();
    setIsGenerating(true);
    setStreamingContent('');
    setShowReasoning(true);

    try {
      setStreamingStatus('Starting enhanced content generation with your preferences...');
      
      // Get target word count and all content preferences
      const targetWordCount = getTargetWordCount();
      
      console.log('Generating content with preferences:', {
        targetWordCount,
        tone: articleData.tone,
        audience: articleData.audience,
        pointOfView: articleData.pointOfView,
        brand: articleData.brand,
        product: articleData.product,
        searchIntent: articleData.searchIntent
      });

      await generateContent({
        title,
        outline: articleData.outline,
        keywords: articleData.keywords,
        audience: articleData.audience,
        tone: articleData.tone,
        targetWordCount: targetWordCount,
        pointOfView: articleData.pointOfView,
        brand: articleData.brand,
        product: articleData.product,
        searchIntent: articleData.searchIntent
      });

      // Update with final content when complete
      if (finalContent) {
        onUpdate({ generatedContent: finalContent });
        setStreamingContent(finalContent);
        setStreamingStatus('Enhanced content generation complete!');
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStreamingStatus(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      
      setTimeout(() => {
        setShowReasoning(false);
      }, 3000);
    }
  };

  // Sync final content when generation completes
  React.useEffect(() => {
    if (finalContent && !isEnhancedGenerating) {
      onUpdate({ generatedContent: finalContent });
      setStreamingContent(finalContent);
    }
  }, [finalContent, isEnhancedGenerating, onUpdate, setStreamingContent]);

  // Sync streaming status
  React.useEffect(() => {
    if (currentMessage) {
      setStreamingStatus(currentMessage);
    }
  }, [currentMessage, setStreamingStatus]);

  const displayError = enhancedError;
  const isGeneratingContent = isEnhancedGenerating;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="w-5 h-5 text-green-600" />
            Generate Enhanced Article Content  
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>Generate your article with all your preferences applied:</p>
            <div className="bg-blue-50 p-3 rounded-lg text-xs">
              <p><strong>Target:</strong> {getTargetWordCount()} words • <strong>Tone:</strong> {articleData.tone}</p>
              <p><strong>Audience:</strong> {articleData.audience} • <strong>POV:</strong> {articleData.pointOfView} person</p>
              {(articleData.brand || articleData.product) && (
                <p><strong>Brand:</strong> {articleData.brand} • <strong>Product:</strong> {articleData.product}</p>
              )}
            </div>
          </div>

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
                textStream={currentMessage}
                mode="typewriter"
                className="text-sm text-green-800"
              />
            </ReasoningContent>
          </Reasoning>

          {/* Progress Display */}
          {isGeneratingContent && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {currentMessage || 'Processing...'}
                </span>
              </div>
              <div className="text-xs text-blue-600">
                Progress: {Math.round(overallProgress)}% • Target: {getTargetWordCount()} words
              </div>
            </div>
          )}

          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation Failed</p>
                <p className="text-xs text-red-600 mt-1">{displayError}</p>
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
                Generating {getTargetWordCount()}-Word Article...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate {getTargetWordCount()}-Word Article
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

      {(articleData.generatedContent || finalContent) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="w-5 h-5 text-green-600" />
              Ready to Create
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your enhanced article content has been generated! Click "Create Article" to save it and continue editing.
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
