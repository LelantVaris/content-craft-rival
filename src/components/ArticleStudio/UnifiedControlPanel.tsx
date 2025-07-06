import React, { useState } from 'react';
import { ArticleStudioData, GenerationStep } from '@/hooks/useArticleStudio';
import { ContentBriefForm } from './ContentBriefForm';
import { TitleGenerationSection } from './TitleGenerationSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  generatedTitles: string[];
  setGeneratedTitles: (titles: string[]) => void;
  enhancedGeneration: any;
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
  streamingContent,
  generatedTitles,
  setGeneratedTitles,
  enhancedGeneration
}) => {
  const [seoProMode, setSeoProMode] = useState(true);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

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
      setGeneratedTitles([]);
      setStreamingContent('');
    } else if (targetStep === 2 && currentStep === 3) {
      // Go back to step 2 - clear article content but keep outline
      updateArticleData({ generatedContent: '' });
      setStreamingContent('');
    }
  };

  const handleGenerateTitles = async () => {
    console.log('=== HANDLE GENERATE TITLES START ===');
    console.log('Article data topic:', articleData.topic);
    console.log('Article data keywords:', articleData.keywords);
    console.log('Article data audience:', articleData.audience);
    console.log('Is generating titles:', isGeneratingTitles);

    if (!articleData.topic || isGeneratingTitles) {
      if (!articleData.topic) {
        console.error('No topic provided');
        toast.error('Please enter a topic first');
      }
      if (isGeneratingTitles) {
        console.log('Already generating titles, skipping');
      }
      return;
    }

    console.log('Starting title generation with payload:', {
      topic: articleData.topic,
      keywords: articleData.keywords,
      audience: articleData.audience
    });

    setIsGeneratingTitles(true);
    setGenerationStep(GenerationStep.GENERATING_TITLES);
    
    try {
      console.log('Calling supabase function...');
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience,
          count: 5
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Title generation error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Failed to generate titles: ${error.message}`);
        throw error;
      }

      if (data?.titles && Array.isArray(data.titles)) {
        console.log('Generated titles received:', data.titles);
        setGeneratedTitles(data.titles);
        toast.success(`Generated ${data.titles.length} titles successfully!`);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('No titles received from generation');
      }
    } catch (error) {
      console.error('=== TITLE GENERATION ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error details:', error);
      toast.error('Failed to generate titles. Please check your connection and try again.');
    } finally {
      console.log('=== HANDLE GENERATE TITLES END ===');
      setIsGeneratingTitles(false);
      setGenerationStep(GenerationStep.IDLE);
    }
  };

  const handleGenerateOutline = async () => {
    if (!hasTitle) {
      toast.error('Please select a title first');
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
          audience: articleData.audience,
          tone: articleData.tone,
          targetWordCount: getTargetWordCount()
        }
      });

      if (error) {
        console.error('Outline generation error:', error);
        toast.error('Failed to generate outline. Please try again.');
        throw error;
      }

      if (data?.sections && Array.isArray(data.sections)) {
        updateArticleData({ outline: data.sections });
        toast.success(`Generated outline with ${data.sections.length} sections!`);
        console.log('Generated outline sections:', data.sections);
      } else {
        throw new Error('No outline sections received from generation');
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Failed to generate outline. Please check your connection and try again.');
    } finally {
      setGenerationStep(GenerationStep.IDLE);
    }
  };

  const handleGenerateArticle = async () => {
    if (!hasTitle || !hasOutline) {
      toast.error(!hasTitle ? 'Please select a title first' : 'Please generate an outline first');
      return;
    }

    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    console.log('=== STARTING ENHANCED ARTICLE GENERATION DEBUG ===');
    console.log('Article data check:', {
      title: finalTitle,
      outlineLength: articleData.outline.length,
      keywords: articleData.keywords,
      primaryKeyword: getPrimaryKeyword(),
      secondaryKeywords: getSecondaryKeywords(),
      targetWordCount: getTargetWordCount(),
      audience: articleData.audience,
      tone: articleData.tone,
      pointOfView: articleData.pointOfView,
      brand: articleData.brand,
      product: articleData.product,
      searchIntent: articleData.searchIntent
    });
    
    setGenerationStep(GenerationStep.GENERATING_ARTICLE);
    setStreamingContent('');
    setStreamingStatus('Starting enhanced article generation...');
    
    try {
      // Reset previous enhanced generation state
      console.log('Resetting enhanced generation state...');
      enhancedGeneration.reset();
      
      // Prepare comprehensive parameters with defaults for missing values
      const generationParams = {
        title: finalTitle,
        outline: articleData.outline,
        keywords: articleData.keywords.length > 0 ? articleData.keywords : [getPrimaryKeyword()].filter(Boolean),
        audience: articleData.audience || 'general audience',
        tone: articleData.tone || 'professional',
        targetWordCount: getTargetWordCount(),
        pointOfView: articleData.pointOfView || 'second',
        brand: articleData.brand || '',
        product: articleData.product || '',
        searchIntent: articleData.searchIntent || 'informational',
        primaryKeyword: getPrimaryKeyword() || articleData.keywords[0] || ''
      };

      console.log('Calling enhanced generation with complete parameters:', generationParams);

      await enhancedGeneration.generateContent(generationParams);

      console.log('Enhanced generation call completed successfully');
      toast.success('Enhanced article generation started successfully!');
      
    } catch (error) {
      console.error('=== ENHANCED ARTICLE GENERATION ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast.error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStreamingStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerationStep(GenerationStep.IDLE);
    }
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
          onTitlesGenerated={setGeneratedTitles}
          generationStep={generationStep}
          currentStep={getCurrentStep()}
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
