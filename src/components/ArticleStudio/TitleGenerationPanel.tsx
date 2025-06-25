
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Plus, X } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TitleGenerationPanelProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
}

export const TitleGenerationPanel: React.FC<TitleGenerationPanelProps> = ({
  articleData,
  onUpdate
}) => {
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const handleGenerateTitles = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
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

  const addKeyword = () => {
    if (newKeyword.trim() && !articleData.keywords.includes(newKeyword.trim())) {
      onUpdate({
        keywords: [...articleData.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    onUpdate({
      keywords: articleData.keywords.filter(k => k !== keyword)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Topic & Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Article Topic</Label>
            <Input
              id="topic"
              placeholder="Enter your article topic..."
              value={articleData.topic}
              onChange={(e) => onUpdate({ topic: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="audience">Target Audience (Optional)</Label>
            <Input
              id="audience"
              placeholder="e.g., Small business owners, Developers..."
              value={articleData.audience}
              onChange={(e) => onUpdate({ audience: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Keywords</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {articleData.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeKeyword(keyword)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerateTitles}
            disabled={!articleData.topic.trim() || isGenerating}
            className="w-full"
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
        </CardContent>
      </Card>

      {generatedTitles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated Titles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {generatedTitles.map((title, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  articleData.selectedTitle === title
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onUpdate({ selectedTitle: title, customTitle: '' })}
              >
                <p className="text-sm font-medium">{title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Write your own title..."
            value={articleData.customTitle || ''}
            onChange={(e) => onUpdate({ customTitle: e.target.value, selectedTitle: '' })}
          />
        </CardContent>
      </Card>
    </div>
  );
};
