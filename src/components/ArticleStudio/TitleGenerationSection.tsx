import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { ArticleStudioData, GenerationStep } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';

interface TitleGenerationSectionProps {
  articleData: ArticleStudioData;
  onTitlesGenerated: (titles: string[]) => void;
  generationStep: GenerationStep;
  currentStep: number;
  hasTitle: boolean;
  hasOutline: boolean;
  setStreamingContent: (content: string) => void;
  setStreamingStatus: (status: string) => void;
  onGenerateTitles: () => Promise<void>;
  onGenerateOutline: () => Promise<void>;
  onGenerateArticle: () => Promise<void>;
}

export const TitleGenerationSection: React.FC<TitleGenerationSectionProps> = ({
  articleData,
  onTitlesGenerated,
  generationStep,
  currentStep,
  hasTitle,
  hasOutline,
  setStreamingContent,
  setStreamingStatus,
  onGenerateTitles,
  onGenerateOutline,
  onGenerateArticle
}) => {
  const [titleCount, setTitleCount] = useState(4);

  const isGenerating = generationStep !== GenerationStep.IDLE;

  const getButtonText = () => {
    if (isGenerating) {
      if (currentStep === 1) return 'Generating titles...';
      if (currentStep === 2) return 'Generating outline...';
      if (currentStep === 3) return 'Generating article...';
    }
    
    if (currentStep === 1) {
      return 'Generate titles';
    } else if (currentStep === 2) {
      return 'Generate outline';
    } else {
      return 'Generate article';
    }
  };

  const handleGenerate = async () => {
    if (currentStep === 1) {
      await onGenerateTitles();
    } else if (currentStep === 2) {
      await onGenerateOutline();
    } else {
      await onGenerateArticle();
    }
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
    <div className="sticky bottom-0 bg-white border-t border-[rgb(208,213,221)] p-6 h-20 flex items-center">
      <div className="flex items-center justify-between gap-4 w-full">
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
        
        {/* Title Count Controls - Only show in step 1 */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center gap-1">
            <label className="text-xs font-semibold text-[rgb(16,24,40)] whitespace-nowrap">
              # of titles
            </label>
            <div className="flex items-center gap-2">
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
                className="w-16 text-center h-8"
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
          </div>
        )}
      </div>
    </div>
  );
};
