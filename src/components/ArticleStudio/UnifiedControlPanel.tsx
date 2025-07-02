import React, { useState } from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { ContentBriefForm } from './ContentBriefForm';
import { TitleGenerationSection } from './TitleGenerationSection';

interface UnifiedControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setStreamingStatus: (status: any) => void;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  saveAndComplete,
  isGenerating,
  setStreamingContent,
  setIsGenerating,
  setStreamingStatus
}) => {
  const [seoProMode, setSeoProMode] = useState(true);
  const [isTitleGenerating, setIsTitleGenerating] = useState(false);

  const hasTitle = !!(articleData.selectedTitle || articleData.customTitle);
  const hasOutline = articleData.outline.length > 0;

  // Step navigation logic
  const getCurrentStep = () => {
    if (!hasTitle) return 1;
    if (!hasOutline) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();

  const handleStepClick = (targetStep: number) => {
    // Only allow going back to previous steps, not forward
    if (targetStep >= currentStep) return;
    
    if (targetStep === 1) {
      // Go back to step 1 - clear titles and outline
      updateArticleData({ 
        selectedTitle: '', 
        customTitle: '', 
        outline: [],
        generatedContent: ''
      });
      setStreamingContent('');
    } else if (targetStep === 2 && currentStep === 3) {
      // Go back to step 2 - clear article content but keep outline
      updateArticleData({ generatedContent: '' });
      setStreamingContent('');
    }
  };

  const handleTitlesGenerated = (titles: string[]) => {
    // This will be handled by the LivePreviewPanel
    console.log('Titles generated:', titles);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-h-[calc(100vh-56px)]">
      {/* Step Navigation - Fixed top */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
        <nav className="flex items-center justify-center space-x-8">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleStepClick(1)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              currentStep >= 1 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className={`font-medium transition-colors ${
              currentStep >= 1 ? 'text-purple-600 hover:text-purple-700' : 'text-gray-400'
            }`}>
              Title
            </span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleStepClick(2)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              currentStep >= 2 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-500'
            } ${currentStep < 2 ? 'cursor-not-allowed' : ''}`}>
              2
            </div>
            <span className={`font-medium transition-colors ${
              currentStep >= 2 ? 'text-purple-600 hover:text-purple-700' : 'text-gray-400'
            } ${currentStep < 2 ? 'cursor-not-allowed' : ''}`}>
              Outline
            </span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleStepClick(3)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              currentStep >= 3 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-500'
            } ${currentStep < 3 ? 'cursor-not-allowed' : ''}`}>
              3
            </div>
            <span className={`font-medium transition-colors ${
              currentStep >= 3 ? 'text-purple-600 hover:text-purple-700' : 'text-gray-400'
            } ${currentStep < 3 ? 'cursor-not-allowed' : ''}`}>
              Article
            </span>
          </div>
        </nav>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <ContentBriefForm
          articleData={articleData}
          onUpdate={updateArticleData}
          seoProMode={seoProMode}
          onSeoProModeChange={setSeoProMode}
        />
      </div>

      {/* Fixed Bottom Section - Always Visible with fixed height */}
      <div className="flex-shrink-0 h-20">
        <TitleGenerationSection
          articleData={articleData}
          onTitlesGenerated={handleTitlesGenerated}
          isGenerating={isTitleGenerating}
          setIsGenerating={setIsTitleGenerating}
          currentStep={currentStep}
          hasTitle={hasTitle}
          hasOutline={hasOutline}
          setStreamingContent={setStreamingContent}
          setStreamingStatus={setStreamingStatus}
          setMainIsGenerating={setIsGenerating}
        />
      </div>
    </div>
  );
};
