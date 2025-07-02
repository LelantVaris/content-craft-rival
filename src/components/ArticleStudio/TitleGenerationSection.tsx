
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';

interface TitleGenerationSectionProps {
  articleData: ArticleStudioData;
  onTitlesGenerated: (titles: string[]) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

export const TitleGenerationSection: React.FC<TitleGenerationSectionProps> = ({
  articleData,
  onTitlesGenerated,
  isGenerating,
  setIsGenerating
}) => {
  const [titleCount, setTitleCount] = useState(4);

  const handleGenerateTitles = async () => {
    if (!articleData.topic) return;

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

      if (error) throw error;
      onTitlesGenerated(data.titles || []);
    } catch (error) {
      console.error('Error generating titles:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const adjustTitleCount = (delta: number) => {
    setTitleCount(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-[rgb(208,213,221)] p-6 space-y-4">
      <Button
        onClick={handleGenerateTitles}
        disabled={!articleData.topic || isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
        size="lg"
      >
        {isGenerating ? 'Generating titles...' : 'Generate titles'}
      </Button>
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[rgb(16,24,40)]">
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
      </div>
    </div>
  );
};
