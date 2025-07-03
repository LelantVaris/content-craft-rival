import React, { useState } from 'react';
import { ArticleStudioData, GenerationStep } from '@/hooks/useArticleStudio';
import { ContentBriefForm } from './ContentBriefForm';
import { TitleGenerationSection } from './TitleGenerationSection';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  saveAndComplete: () => Promise<void>;
  generationStep: GenerationStep;
  setStreamingContent: (content: string) => void;
  setGenerationStep: (step: GenerationStep) => void;
  setStreamingStatus: (status: string) => void;
  getPrimaryKeyword: () => string;
  getSecondaryKeywords: () => string[];
  getTargetWordCount: () => number;
  streamingContent: string;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  saveAndComplete,
  generationStep,
  setStreamingContent,
  setGenerationStep,
  setStreamingStatus,
  getPrimaryKeyword,
  getSecondaryKeywords,
  getTargetWordCount,
  streamingContent
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

  const handleGenerateTitles = async () => {
    if (!articleData.topic) {
      console.error('No topic provided');
      return;
    }

    console.log('Starting title generation with:', {
      topic: articleData.topic,
      keywords: articleData.keywords,
      audience: articleData.audience
    });

    setGenerationStep(GenerationStep.GENERATING_TITLES);
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience,
          count: 4
        }
      });

      if (error) throw error;

      if (data?.titles && Array.isArray(data.titles)) {
        // Dispatch event to notify LivePreviewPanel with the titles
        window.dispatchEvent(new CustomEvent('titles-generated', { 
          detail: data.titles 
        }));
      }
    } catch (error) {
      console.error('Error generating titles:', error);
    } finally {
      setGenerationStep(GenerationStep.IDLE);
    }
  };

  const handleGenerateOutline = async () => {
    if (!hasTitle) {
      console.error('No title selected');
      return;
    }

    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    setGenerationStep(GenerationStep.GENERATING_OUTLINE);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          title: finalTitle,
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (error) throw error;

      if (data?.sections && Array.isArray(data.sections)) {
        window.dispatchEvent(new CustomEvent('outline-generated', { 
          detail: data.sections 
        }));
      }
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setGenerationStep(GenerationStep.IDLE);
    }
  };

  const handleGenerateArticle = async () => {
    if (!hasOutline) {
      console.error('No outline available');
      return;
    }

    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    setGenerationStep(GenerationStep.GENERATING_ARTICLE);
    setStreamingContent('');
    
    try {
      const response = await fetch(`https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZXpka2xla2FuZmNjdHN3dGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODg4NzgsImV4cCI6MjA2NjM2NDg3OH0.GRm70_874KITS3vkxgjVdWNed0Z923P_bFD6TOF6dgk`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: finalTitle,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience,
          tone: 'professional'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                console.log('Article generation completed');
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  setStreamingContent(accumulatedContent);
                }
              } catch (parseError) {
                continue;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating article:', error);
    } finally {
      setGenerationStep(GenerationStep.IDLE);
    }
  };

  const handleTitlesGenerated = (titles: string[]) => {
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
          generationStep={generationStep}
          currentStep={currentStep}
          hasTitle={hasTitle}
          hasOutline={hasOutline}
          setStreamingContent={setStreamingContent}
          setStreamingStatus={setStreamingStatus}
          onGenerateTitles={handleGenerateTitles}
          onGenerateOutline={handleGenerateOutline}
          onGenerateArticle={handleGenerateArticle}
        />
      </div>
    </div>
  );
};
