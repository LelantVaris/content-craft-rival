
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Lightbulb, Plus, Sparkles } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TitleGenerationPanelProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
  generatedTitles: string[];
  setGeneratedTitles: (titles: string[]) => void;
  isFormValid: () => boolean;
}

export const TitleGenerationPanel: React.FC<TitleGenerationPanelProps> = ({
  articleData,
  onUpdate,
  generatedTitles,
  setGeneratedTitles,
  isFormValid
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTitle, setCustomTitle] = useState(articleData.customTitle || '');

  const handleGenerateTitles = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in the required fields first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience,
          tone: articleData.tone
        }
      });

      if (error) throw error;
      setGeneratedTitles(data.titles || []);
    } catch (error) {
      console.error('Error generating titles:', error);
      toast.error('Failed to generate titles. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTitleSelect = (title: string) => {
    onUpdate({ selectedTitle: title, customTitle: '' });
    setCustomTitle('');
  };

  const handleCustomTitleChange = (value: string) => {
    setCustomTitle(value);
    onUpdate({ customTitle: value, selectedTitle: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Generate Article Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateTitles}
            disabled={isGenerating || !isFormValid()}
            className="w-full mb-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Titles...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Titles
              </>
            )}
          </Button>

          {generatedTitles.length > 0 && (
            <div className="space-y-4">
              <RadioGroup
                value={articleData.selectedTitle}
                onValueChange={handleTitleSelect}
              >
                {generatedTitles.map((title, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={title} id={`title-${index}`} />
                    <Label 
                      htmlFor={`title-${index}`} 
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {title}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5 text-blue-600" />
            Custom Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your custom title..."
            value={customTitle}
            onChange={(e) => handleCustomTitleChange(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            Or create your own custom title instead of using the generated ones
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
