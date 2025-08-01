import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ArticleStudioData, GenerationStep } from '@/hooks/useArticleStudio';
import { StreamingArticlePreview } from './StreamingArticlePreview';
import { LiveArticleStats } from './LiveArticleStats';
import { RealtimeSEOPanel } from './RealtimeSEOPanel';
import { EnhancedPublishingOptions } from './EnhancedPublishingOptions';
import { EmptyStateDisplay } from './EmptyStateDisplay';
import { AnimatedLoadingSkeleton } from './AnimatedLoadingSkeleton';

interface LivePreviewPanelProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  saveAndComplete: () => Promise<void>;
  generationStep: GenerationStep;
  streamingStatus?: string | null;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  generatedTitles: string[];
  enhancedGeneration: any; // Enhanced generation state from main hook
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  articleData,
  streamingContent,
  saveAndComplete,
  generationStep,
  streamingStatus,
  updateArticleData,
  generatedTitles,
  enhancedGeneration
}) => {
  const [customTitle, setCustomTitle] = useState('');
  
  const finalTitle = articleData.customTitle || articleData.selectedTitle || '';
  const finalContent = streamingContent || enhancedGeneration?.finalContent || articleData.generatedContent || '';
  const safeStreamingStatus = streamingStatus ? String(streamingStatus) : '';

  // Progressive display logic
  const hasTopic = !!articleData.topic;
  const hasGeneratedTitles = generatedTitles.length > 0;
  const hasSelectedTitle = !!finalTitle;
  const hasOutline = articleData.outline.length > 0;
  const hasContent = !!finalContent;
  
  // Helper to check if currently generating (including enhanced generation)
  const isGenerating = generationStep !== GenerationStep.IDLE || enhancedGeneration?.isGenerating;

  console.log('LivePreviewPanel render:', {
    finalContent: finalContent.length,
    streamingContent: streamingContent.length,
    enhancedFinalContent: enhancedGeneration?.finalContent?.length || 0,
    isGenerating,
    enhancedIsGenerating: enhancedGeneration?.isGenerating
  });

  // Determine current step
  const getCurrentStep = () => {
    if (!hasSelectedTitle) return 1;
    if (!hasOutline) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();

  const handleTitleSelect = (title: string) => {
    updateArticleData({ selectedTitle: title, customTitle: '' });
    setCustomTitle('');
  };

  const handleCustomTitleSubmit = () => {
    if (customTitle.trim()) {
      updateArticleData({ customTitle: customTitle.trim(), selectedTitle: '' });
    }
  };

  const handleTryExample = (topic: string) => {
    updateArticleData({ topic });
  };

  const canGoBack = currentStep > 1;
  const canContinue = () => {
    switch (currentStep) {
      case 1: return hasSelectedTitle;
      case 2: return hasOutline;
      case 3: return hasContent;
      default: return false;
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      // Go back to step 2 - clear article content but keep outline
      updateArticleData({ generatedContent: '' });
    } else if (currentStep === 2) {
      // Go back to step 1 - clear titles and outline
      updateArticleData({ 
        selectedTitle: '', 
        customTitle: '', 
        outline: []
      });
    }
  };

  const handleContinue = () => {
    console.log('Continue clicked for step:', currentStep);
  };

  const renderContent = () => {
    // State 1: Empty state when no topic
    if (!hasTopic) {
      return (
        <div className="flex items-center justify-center h-full">
          <EmptyStateDisplay onTryExample={handleTryExample} />
        </div>
      );
    }

    // State 2: Loading state (Title Generation)
    if (isGenerating && currentStep === 1) {
      return <AnimatedLoadingSkeleton />;
    }

    // State 3: Title Selection
    if (hasTopic && !hasSelectedTitle) {
      if (!hasGeneratedTitles) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ready to generate titles
              </h3>
              <p className="text-gray-600">
                Click "Generate titles" in the left panel to get started
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Choose your article title
            </h3>
            <p className="text-gray-600">
              Select from AI-generated titles or write your own
            </p>
          </div>

          <RadioGroup value={articleData.selectedTitle} onValueChange={handleTitleSelect}>
            <div className="space-y-3">
              {generatedTitles.map((title, index) => (
                <Card key={index} className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value={title} id={`title-${index}`} className="mt-1" />
                    <Label 
                      htmlFor={`title-${index}`} 
                      className="flex-1 cursor-pointer font-medium leading-relaxed"
                    >
                      {title}
                    </Label>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>

          <div className="border-t pt-6">
            <Label className="text-sm font-semibold text-gray-900 mb-2 block">
              Or write your own title
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your custom title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomTitleSubmit()}
                className="flex-1"
              />
              <Button onClick={handleCustomTitleSubmit} disabled={!customTitle.trim()}>
                Use Title
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // State 4: Outline Loading or Display
    if (hasSelectedTitle && !hasOutline) {
      if (isGenerating && currentStep === 2) {
        return (
          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generating your outline...
              </h3>
              <p className="text-gray-600">
                AI is creating a structured outline for your article
              </p>
            </div>
            
            <AnimatedLoadingSkeleton />
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ready to generate outline
            </h3>
            <p className="text-gray-600">
              Click "Generate outline" to create your article structure
            </p>
          </div>
        </div>
      );
    }

    // State 5: Article Preview with Outline - UPDATED to pass enhanced generation
    if (hasSelectedTitle && hasOutline) {
      return (
        <div className="space-y-6 h-full flex flex-col">
          {/* Article Stats */}
          {finalContent && finalContent.length > 500 && !isGenerating && (
            <div className="px-6 pt-6">
              <LiveArticleStats
                title={finalTitle}
                content={finalContent}
                keywords={articleData.keywords}
                isGenerating={isGenerating}
              />
            </div>
          )}
          
          {/* Main Content - UPDATED to pass enhanced generation state */}
          <div className="flex-1 px-6">
            {hasContent ? (
              <StreamingArticlePreview
                title={finalTitle}
                content={finalContent}
                isGenerating={isGenerating}
                streamingContent={streamingContent}
                streamingStatus={safeStreamingStatus}
                outline={articleData.outline}
                useEnhancedGeneration={true}
                enhancedGeneration={enhancedGeneration}
              />
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{finalTitle}</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Article Outline</h3>
                  {articleData.outline.map((section, index) => (
                    <Card key={section.id} className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {index + 1}. {section.title}
                      </h4>
                      <p className="text-gray-600 text-sm">{section.content}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom Panels */}
          {finalContent && finalContent.length > 600 && !isGenerating && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {finalContent.length > 800 && (
                  <RealtimeSEOPanel
                    title={finalTitle}
                    content={finalContent}
                    keywords={articleData.keywords}
                    targetAudience={articleData.audience}
                  />
                )}
                
                <EnhancedPublishingOptions
                  onSave={saveAndComplete}
                  onPublish={saveAndComplete}
                  disabled={!finalTitle || isGenerating}
                  isGenerating={isGenerating}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[calc(100vh-56px)] bg-gray-50/30 flex flex-col max-h-[calc(100vh-56px)]">
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      
      {/* Continue/Back Buttons at Bottom with fixed height */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 h-20 flex items-center">
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack || isGenerating}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!canContinue() || isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
