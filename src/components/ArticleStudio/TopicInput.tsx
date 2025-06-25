
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { getRandomExampleTopic, getAllExampleTopics } from '@/utils/exampleTopics';

interface TopicInputProps {
  topic: string;
  onTopicChange: (topic: string) => void;
}

export const TopicInput: React.FC<TopicInputProps> = ({
  topic,
  onTopicChange
}) => {
  const [allExamples] = React.useState(getAllExampleTopics());
  const [currentExampleIndex, setCurrentExampleIndex] = React.useState(0);

  const handleTryExample = () => {
    const example = allExamples[currentExampleIndex];
    onTopicChange(example.topic);
    setCurrentExampleIndex((prev) => (prev + 1) % allExamples.length);
    toast.success(`Example from ${example.category} category`);
  };

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Write an article about...
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="e.g., Best content marketing strategies for B2B SaaS companies in 2024"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="min-h-[100px] text-base resize-none"
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTryExample}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Try Example Topics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
