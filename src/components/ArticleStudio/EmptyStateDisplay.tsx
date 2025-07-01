
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRandomExampleTopic } from '@/utils/exampleTopics';

interface EmptyStateDisplayProps {
  onTryExample: (topic: string) => void;
}

export const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
  onTryExample
}) => {
  const handleTryExample = () => {
    const { topic } = getRandomExampleTopic();
    onTryExample(topic);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No titles generated</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        Describe your topic to our AI to start generating creative article ideas and titles.
      </p>
      <Button 
        onClick={handleTryExample}
        variant="outline"
        className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
      >
        Try Example
      </Button>
    </div>
  );
};
