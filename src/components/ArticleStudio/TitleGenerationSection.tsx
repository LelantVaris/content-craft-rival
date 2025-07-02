
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
  setStreamingContent: (content: string) => void;
  setStreamingStatus: (status: any) => void;
  setMainIsGenerating: (generating: boolean) => void;
  loadingState?: { isLoading: boolean; operation?: string };
}

export const TitleGenerationSection: React.FC<TitleGenerationSectionProps> = ({
  articleData,
  onTitlesGenerated,
  isGenerating,
  setIsGenerating,
  currentStep,
  hasTitle,
  hasOutline,
  setStreamingContent,
  setStreamingStatus,
  setMainIsGenerating,
  loadingState
}) => {
  const [titleCount, setTitleCount] = useState(4);

  const getButtonText = () => {
    if (loadingState?.isLoading) {
      const operation = loadingState.operation || 'Processing';
      return `${operation}...`;
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
    if (!hasTitle) {
      console.error('No title selected');
      return;
    }

    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    console.log('Starting outline generation with:', {
      title: finalTitle,
      topic: articleData.topic,
      keywords: articleData.keywords,
      audience: articleData.audience
    });

    // Dispatch event to notify LivePreviewPanel that outline generation is starting
    window.dispatchEvent(new CustomEvent('outline-generation-start'));

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          title: finalTitle,
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      console.log('Outline generation response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.sections && Array.isArray(data.sections)) {
        console.log('Generated outline:', data.sections);
        
        // Dispatch event to notify LivePreviewPanel with the outline
        window.dispatchEvent(new CustomEvent('outline-generated', { 
          detail: data.sections 
        }));
      } else {
        throw new Error('Invalid response format from outline generation');
      }
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!hasOutline) {
      console.error('No outline available');
      return;
    }

    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    console.log('Starting article generation with:', {
      title: finalTitle,
      outline: articleData.outline,
      keywords: articleData.keywords,
      audience: articleData.audience
    });

    setIsGenerating(true);
    setMainIsGenerating(true);
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
          tone: 'professional' // You might want to get this from form data
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
                // Skip invalid JSON
                continue;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating article:', error);
    } finally {
      setIsGenerating(false);
      setMainIsGenerating(false);
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
      <div className="flex items-center gap-4 w-full">
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
          disabled={!canGenerate() || isGenerating || loadingState?.isLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
          size="lg"
        >
          {(isGenerating || loadingState?.isLoading) ? (
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
