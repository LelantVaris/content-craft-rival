
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
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">No content yet</h3>
      
      <p className="text-gray-500 mb-8 leading-relaxed">
        Start by entering your topic in the left panel. Our AI will help you create engaging article titles and content.
      </p>
      
      <Button 
        onClick={handleTryExample}
        variant="outline"
        className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
        size="lg"
      >
        Try Example Topic
      </Button>
      
      <div className="mt-6 text-xs text-gray-400">
        AI-powered • SEO optimized • Real-time preview
      </div>
    </div>
  );
};
