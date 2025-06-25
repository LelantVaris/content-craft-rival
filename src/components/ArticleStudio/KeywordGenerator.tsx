
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wand2, Plus, X } from 'lucide-react';

interface KeywordGeneratorProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onGenerateKeywords: () => Promise<void>;
  isGenerating: boolean;
  hasTopic: boolean;
}

export const KeywordGenerator: React.FC<KeywordGeneratorProps> = ({
  keywords,
  onKeywordsChange,
  onGenerateKeywords,
  isGenerating,
  hasTopic
}) => {
  const [currentKeyword, setCurrentKeyword] = React.useState('');

  const handleKeywordAdd = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      const newKeywords = [...keywords, currentKeyword.trim()];
      onKeywordsChange(newKeywords);
      setCurrentKeyword('');
    }
  };

  const handleKeywordRemove = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(k => k !== keywordToRemove);
    onKeywordsChange(newKeywords);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Target Keywords</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateKeywords}
          disabled={isGenerating || !hasTopic}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          AI Generate
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add keyword..."
          value={currentKeyword}
          onChange={(e) => setCurrentKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleKeywordAdd}
          disabled={!currentKeyword.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {keyword}
              <button
                onClick={() => handleKeywordRemove(keyword)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
