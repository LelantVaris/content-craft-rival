
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
    progress,
    currentMessage,
    error: enhancedError,
    finalContent,
    contentQuality,
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

    reset();
    setIsGenerating(true);
    setStreamingContent('');
    setShowReasoning(true);

    try {
      setStreamingStatus('Starting enhanced content generation...');
      
      // Pass ALL content preferences to the generation function
      await generateContent({
        title,
        outline: articleData.outline,
        keywords: articleData.keywords,
        audience: articleData.audience,
        tone: articleData.tone,
        targetWordCount: getTargetWordCount(),
        pointOfView: articleData.pointOfView,
        brand: articleData.brand,
        product: articleData.product,
        searchIntent: articleData.searchIntent,
        primaryKeyword: getPrimaryKeyword()
      });

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStreamingStatus(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setShowReasoning(false), 3000);
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
            Generate PVOD Article Content  
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate high-quality content following PVOD framework (Personality, Value, Opinion, Direct) with guaranteed word count and SEO optimization.
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
                textStream={currentMessage}
                mode="typewriter"
                className="text-sm text-green-800"
              />
            </ReasoningContent>
          </Reasoning>

          {/* Enhanced Progress Display with PVOD indicators */}
          {isGeneratingContent && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {currentMessage || 'Processing PVOD content...'}
                </span>
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>Section {progress.currentSection}/{progress.totalSections} • {progress.wordsGenerated}/{progress.targetWords} words</div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((progress.wordsGenerated / progress.targetWords) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content Quality Indicators */}
          {contentQuality && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Content Quality Report</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${contentQuality.wordCountMet ? 'text-green-700' : 'text-amber-700'}`}>
                  {contentQuality.wordCountMet ? '✅' : '⚠️'} Target Word Count
                </div>
                <div className={`flex items-center gap-1 ${contentQuality.pvotFramework ? 'text-green-700' : 'text-amber-700'}`}>
                  {contentQuality.pvotFramework ? '✅' : '⚠️'} PVOD Framework
                </div>
                <div className={`flex items-center gap-1 ${contentQuality.keywordIntegration ? 'text-green-700' : 'text-amber-700'}`}>
                  {contentQuality.keywordIntegration ? '✅' : '⚠️'} Keyword Integration
                </div>
                <div className={`flex items-center gap-1 ${contentQuality.seoOptimized ? 'text-green-700' : 'text-amber-700'}`}>
                  {contentQuality.seoOptimized ? '✅' : '⚠️'} SEO Optimized
                </div>
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
                Generating PVOD Content...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate PVOD Content ({getTargetWordCount()} words)
              </>
            )}
          </Button>

          {!canGenerate() && (
            <p className="text-xs text-gray-500 text-center">
              Complete title and outline steps to enable PVOD content generation
            </p>
          )}
        </CardContent>
      </Card>

      {(articleData.generatedContent || finalContent) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="w-5 h-5 text-green-600" />
              PVOD Article Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your PVOD article has been generated with comprehensive content guidelines! Click "Create Article" to save it and continue editing.
            </p>
            {contentQuality && (
              <div className="mb-4 text-sm text-green-700">
                Generated {progress.wordsGenerated} words following PVOD framework with full SEO optimization.
              </div>
            )}
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
