
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';

interface TitleGenerationSectionProps {
  articleData: ArticleStudioData;
  onTitlesGenerated: (titles: string[]) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  currentStep: number;
  hasTitle: boolean;
  hasOutline: boolean;
}

export const TitleGenerationSection: React.FC<TitleGenerationSectionProps> = ({
  articleData,
  onTitlesGenerated,
  isGenerating,
  setIsGenerating,
  currentStep,
  hasTitle,
  hasOutline
}) => {
  const [titleCount, setTitleCount] = useState(4);

  const getButtonText = () => {
    if (currentStep === 1) {
      return isGenerating ? 'Generating titles...' : 'Generate titles';
    } else if (currentStep === 2) {
      return isGenerating ? 'Generating outline...' : 'Generate outline';
    } else {
      return isGenerating ? 'Generating article...' : 'Generate article';
    }
  };

  const handleGenerate = async () => {
    if (currentStep === 1) {
      handleGenerateTitles();
    } else if (currentStep === 2) {
      handleGenerateOutline();
    } else {
      handleGenerateArticle();
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
      audience: articleData.audience,
      count: titleCount
    });

    // Dispatch event to notify LivePreviewPanel that generation is starting
    window.dispatchEvent(new CustomEvent('title-generation-start'));

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience,
          count: titleCount
        }
      });

      console.log('Title generation response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.titles && Array.isArray(data.titles)) {
        console.log('Generated titles:', data.titles);
        
        // Dispatch event to notify LivePreviewPanel with the titles
        window.dispatchEvent(new CustomEvent('titles-generated', { 
          detail: data.titles 
        }));
        
        onTitlesGenerated(data.titles);
      } else {
        throw new Error('Invalid response format from title generation');
      }
    } catch (error) {
      console.error('Error generating titles:', error);
      // Add user-visible error handling here if needed
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateOutline = async () => {
    // TODO: Implement outline generation
    console.log('Generate outline not implemented yet');
  };

  const handleGenerateArticle = async () => {
    // TODO: Implement article generation
    console.log('Generate article not implemented yet');
  };

  const adjustTitleCount = (delta: number) => {
    setTitleCount(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const canGenerate = () => {
    if (currentStep === 1) return !!articleData.topic;
    if (currentStep === 2) return hasTitle;
    if (currentStep === 3) return hasOutline;
    return false;
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-[rgb(208,213,221)] p-6 space-y-4">
      <div className="flex items-center gap-4">
        {/* Title Count Controls - Only show in step 1 */}
        {currentStep === 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-[rgb(16,24,40)] whitespace-nowrap">
              # of titles
            </label>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTitleCount(-1)}
              disabled={titleCount <= 1}
              className="h-8 w-8"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              value={titleCount}
              onChange={(e) => setTitleCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-16 text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTitleCount(1)}
              disabled={titleCount >= 10}
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate() || isGenerating}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {getButtonText()}
            </div>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </div>
  );
};
