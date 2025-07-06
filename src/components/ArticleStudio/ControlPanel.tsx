
import React from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { TitleGenerationPanel } from './TitleGenerationPanel';
import { OutlineCreationPanel } from './OutlineCreationPanel';
import { ContentGenerationPanel } from './ContentGenerationPanel';
import { StepNavigation } from './StepNavigation';

interface ControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: () => boolean;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setStreamingStatus: (status: string) => void;
  getPrimaryKeyword: () => string;
  getSecondaryKeywords: () => string[];
  getTargetWordCount: () => number;
  generatedTitles: string[];
  setGeneratedTitles: (titles: string[]) => void;
  isFormValid: () => boolean;
  enhancedGeneration: any;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  articleData,
  updateArticleData,
  nextStep,
  prevStep,
  canProceed,
  saveAndComplete,
  isGenerating,
  setStreamingContent,
  setIsGenerating,
  setStreamingStatus,
  getPrimaryKeyword,
  getSecondaryKeywords,
  getTargetWordCount,
  generatedTitles,
  setGeneratedTitles,
  isFormValid,
  enhancedGeneration
}) => {
  const renderStepContent = () => {
    switch (articleData.currentStep) {
      case 1:
        return (
          <TitleGenerationPanel
            articleData={articleData}
            onUpdate={updateArticleData}
            generatedTitles={generatedTitles}
            setGeneratedTitles={setGeneratedTitles}
            isFormValid={isFormValid}
          />
        );
      case 2:
        return (
          <OutlineCreationPanel
            articleData={articleData}
            onUpdate={updateArticleData}
            getPrimaryKeyword={getPrimaryKeyword}
            getSecondaryKeywords={getSecondaryKeywords}
            getTargetWordCount={getTargetWordCount}
          />
        );
      case 3:
        return (
          <ContentGenerationPanel
            articleData={articleData}
            onUpdate={updateArticleData}
            onComplete={saveAndComplete}
            setStreamingContent={setStreamingContent}
            setIsGenerating={setIsGenerating}
            setStreamingStatus={setStreamingStatus}
            getPrimaryKeyword={getPrimaryKeyword}
            getSecondaryKeywords={getSecondaryKeywords}
            getTargetWordCount={getTargetWordCount}
            enhancedGeneration={enhancedGeneration}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4 h-full">
      <StepNavigation
        currentStep={articleData.currentStep}
        onNext={nextStep}
        onPrev={prevStep}
        canProceed={canProceed()}
        onComplete={saveAndComplete}
        isGenerating={isGenerating}
      />
      
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
    </div>
  );
};
