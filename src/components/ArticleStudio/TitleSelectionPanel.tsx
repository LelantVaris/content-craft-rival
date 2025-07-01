
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Lightbulb, Edit3 } from 'lucide-react';

interface TitleSelectionPanelProps {
  generatedTitles: string[];
  selectedTitle: string;
  onTitleSelect: (title: string) => void;
}

export const TitleSelectionPanel: React.FC<TitleSelectionPanelProps> = ({
  generatedTitles,
  selectedTitle,
  onTitleSelect
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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

  return (
    <Card className="border-2 border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Select Your Title
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    Write my own title
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
      </CardContent>
    </Card>
  );
};
