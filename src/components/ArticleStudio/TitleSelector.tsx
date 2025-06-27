
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Sparkles, 
  RefreshCw, 
  Plus,
  Minus,
  Edit3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TitleSelectorProps {
  hasTopic: boolean;
  titleCount: number;
  onTitleCountChange: (count: number) => void;
  onGenerateTitles: () => void;
  isGenerating: boolean;
  generatedTitles: string[];
  selectedTitle: string;
  onTitleSelect: (title: string) => void;
  topic: string;
  keywords: string[];
  audience: string;
}

export const TitleSelector: React.FC<TitleSelectorProps> = ({
  hasTopic,
  titleCount,
  onTitleCountChange,
  isGenerating,
  selectedTitle,
  onTitleSelect,
  topic,
  keywords,
  audience
}) => {
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  const handleTitleCountDecrease = () => {
    onTitleCountChange(Math.max(3, titleCount - 1));
  };

  const handleTitleCountIncrease = () => {
    onTitleCountChange(Math.min(10, titleCount + 1));
  };

  const handleGenerateTitles = async () => {
    if (!topic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsLocalGenerating(true);
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
      setGeneratedTitles(titles);
      
      if (titles.length > 0) {
        toast.success(`Generated ${titles.length} titles`);
      }
    } catch (error) {
      console.error('Error generating titles:', error);
      toast.error('Failed to generate titles. Please try again.');
    } finally {
      setIsLocalGenerating(false);
    }
  };

  const handleTitleSelection = (value: string) => {
    if (value === 'custom') {
      onTitleSelect(customTitle);
    } else {
      onTitleSelect(value);
    }
  };

  const handleCustomTitleChange = (value: string) => {
    setCustomTitle(value);
    if (selectedTitle === customTitle || showCustomInput) {
      onTitleSelect(value);
    }
  };

  if (!hasTopic) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Enter a topic above to generate titles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        disabled={isLocalGenerating || !hasTopic}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
        size="lg"
      >
        {isLocalGenerating ? (
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

      {/* Title Selection */}
      {generatedTitles.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-base font-semibold">Select a title:</Label>
          <RadioGroup value={selectedTitle} onValueChange={handleTitleSelection}>
            <div className="space-y-3">
              {generatedTitles.map((title, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem value={title} id={`title-${index}`} className="mt-1" />
                  <Label 
                    htmlFor={`title-${index}`} 
                    className="flex-1 cursor-pointer font-medium text-gray-900 leading-relaxed"
                  >
                    {title}
                  </Label>
                </div>
              ))}
              
              {/* Custom Title Option */}
              <div className="border-t pt-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="custom" id="custom-title" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="custom-title" className="cursor-pointer font-medium text-gray-900 mb-2 block">
                      Custom Title
                    </Label>
                    <Input
                      placeholder="Enter your custom title..."
                      value={customTitle}
                      onChange={(e) => handleCustomTitleChange(e.target.value)}
                      onFocus={() => setShowCustomInput(true)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
