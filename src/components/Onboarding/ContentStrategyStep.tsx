
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface ContentStrategyStepProps {
  data: {
    targetAudience: string;
    contentGoals: string[];
    preferredTone: string;
  };
  onUpdate: (data: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

const contentGoalOptions = [
  'Increase website traffic',
  'Generate leads',
  'Build brand awareness',
  'Educate customers',
  'Improve SEO rankings',
  'Establish thought leadership'
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'technical', label: 'Technical' }
];

export const ContentStrategyStep: React.FC<ContentStrategyStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [targetAudience, setTargetAudience] = useState(data.targetAudience || '');
  const [contentGoals, setContentGoals] = useState<string[]>(data.contentGoals || []);
  const [preferredTone, setPreferredTone] = useState(data.preferredTone || 'professional');

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setContentGoals([...contentGoals, goal]);
    } else {
      setContentGoals(contentGoals.filter(g => g !== goal));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetAudience.trim()) {
      onUpdate({ targetAudience, contentGoals, preferredTone });
      onNext();
    }
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="text-center pb-6">
        <button
          onClick={onBack}
          className="absolute left-6 top-6 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Define your content strategy
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Help us understand your audience and goals
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-700">
              Who is your target audience? *
            </Label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Small business owners, Marketing professionals, Tech enthusiasts..."
              className="min-h-[80px] text-base"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              What are your content goals? (Select all that apply)
            </Label>
            <div className="space-y-3">
              {contentGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={contentGoals.includes(goal)}
                    onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                  />
                  <Label htmlFor={goal} className="text-sm text-gray-700">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Preferred writing tone
            </Label>
            <Select value={preferredTone} onValueChange={setPreferredTone}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={!targetAudience.trim()}
          >
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
