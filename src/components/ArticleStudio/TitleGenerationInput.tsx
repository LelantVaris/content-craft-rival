
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, RefreshCw, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TitleGenerationInputProps {
  topic: string;
  keywords: string[];
  audience: string;
  onTitlesGenerated: (titles: string[]) => void;
}

export const TitleGenerationInput: React.FC<TitleGenerationInputProps> = ({
  topic,
  keywords,
  audience,
  onTitlesGenerated
}) => {
  const [titleCount, setTitleCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTitleCountDecrease = () => {
    setTitleCount(Math.max(3, titleCount - 1));
  };

  const handleTitleCountIncrease = () => {
    setTitleCount(Math.min(10, titleCount + 1));
  };

  const handleGenerateTitles = async () => {
    if (!topic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic,
          keywords,
          audience,
          count: titleCount
        }
      });

      if (error) throw error;
      
      const titles = data.titles || [];
      onTitlesGenerated(titles);
      
      if (titles.length > 0) {
        toast.success(`Generated ${titles.length} titles`);
      }
    } catch (error) {
      console.error('Error generating titles:', error);
      toast.error('Failed to generate titles. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-purple-100">
      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Article Titles</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get AI-powered title suggestions based on your topic
          </p>
        </div>

        {/* Title Count Selector */}
        <div className="flex items-center justify-between">
          <Label>Number of titles to generate:</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleTitleCountDecrease}
              disabled={titleCount <= 3}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium">{titleCount}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleTitleCountIncrease}
              disabled={titleCount >= 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateTitles}
          disabled={isGenerating || !topic}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating Titles...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {titleCount} Titles
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
