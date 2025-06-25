
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  RefreshCw, 
  Plus,
  Minus
} from 'lucide-react';

interface TitleSelectorProps {
  hasTopic: boolean;
  titleCount: number;
  onTitleCountChange: (count: number) => void;
  onGenerateTitles: () => void;
  isGenerating: boolean;
  generatedTitles: string[];
  selectedTitle: string;
  onTitleSelect: (title: string) => void;
}

export const TitleSelector: React.FC<TitleSelectorProps> = ({
  hasTopic,
  titleCount,
  onTitleCountChange,
  onGenerateTitles,
  isGenerating,
  generatedTitles,
  selectedTitle,
  onTitleSelect
}) => {
  const handleTitleCountDecrease = () => {
    onTitleCountChange(Math.max(3, titleCount - 1));
  };

  const handleTitleCountIncrease = () => {
    onTitleCountChange(Math.min(10, titleCount + 1));
  };

  if (!hasTopic) return null;

  return (
    <Card className="border-2 border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          Generate Titles
        </CardTitle>
        <CardDescription>
          Create engaging titles optimized for your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          onClick={onGenerateTitles}
          disabled={isGenerating || !hasTopic}
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

        {/* Generated Titles */}
        {generatedTitles.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">Select a title:</Label>
            <div className="grid gap-3">
              {generatedTitles.map((title, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    selectedTitle === title
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => onTitleSelect(title)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 flex-1 leading-relaxed">{title}</p>
                      {selectedTitle === title && (
                        <Badge className="bg-green-600 ml-3">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
