
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

  const handleTitlesGenerated = (titles: string[]) => {
    // This will be handled by the LivePreviewPanel
    console.log('Titles generated:', titles);
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Step Navigation - Fixed top */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
        <nav className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className={`font-medium ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              Title
            </span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`font-medium ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              Outline
            </span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
            <span className={`font-medium ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
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

      {/* Fixed Bottom Section - Always Visible */}
      <div className="flex-shrink-0">
        <TitleGenerationSection
          articleData={articleData}
          onTitlesGenerated={handleTitlesGenerated}
          isGenerating={isTitleGenerating}
          setIsGenerating={setIsTitleGenerating}
          currentStep={currentStep}
          hasTitle={hasTitle}
          hasOutline={hasOutline}
        />
      </div>
    </div>
  );
};
