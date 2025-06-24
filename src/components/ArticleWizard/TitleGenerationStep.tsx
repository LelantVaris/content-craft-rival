
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  RefreshCw, 
  PenTool, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ArticleData } from './EnhancedArticleWizard';
import { supabase } from '@/integrations/supabase/client';

interface TitleGenerationStepProps {
  articleData: ArticleData;
  onUpdate: (updates: Partial<ArticleData>) => void;
}

const TitleGenerationStep: React.FC<TitleGenerationStepProps> = ({ articleData, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [showCustomTitle, setShowCustomTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleData.topic && generatedTitles.length === 0) {
      generateTitles();
    }
  }, [articleData.topic]);

  const generateTitles = async () => {
    if (!articleData.topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: {
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (error) throw error;

      if (data?.titles && Array.isArray(data.titles)) {
        setGeneratedTitles(data.titles);
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (err: any) {
      console.error('Error generating titles:', err);
      setError(err.message || 'Failed to generate titles. Please try again.');
      // Fallback to sample titles on error
      setGeneratedTitles([
        "10 Essential Strategies to Boost Your Content Marketing ROI in 2024",
        "The Complete Guide to Content Marketing: From Strategy to Success",
        "How to Create High-Converting Content That Drives Real Results",
        "Content Marketing Mastery: Proven Techniques for Modern Businesses",
        "Transform Your Content Strategy: Expert Tips for Maximum Impact"
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicChange = (topic: string) => {
    onUpdate({ topic });
    if (topic.trim()) {
      setGeneratedTitles([]);
      setError(null);
    }
  };

  const handleKeywordsChange = (keywordsStr: string) => {
    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);
    onUpdate({ keywords });
  };

  const handleTitleSelect = (title: string) => {
    onUpdate({ selectedTitle: title, customTitle: '' });
    setShowCustomTitle(false);
  };

  const handleCustomTitle = (customTitle: string) => {
    onUpdate({ customTitle, selectedTitle: '' });
  };

  return (
    <div className="space-y-6">
      {/* Topic Input */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            What's your article topic?
          </CardTitle>
          <CardDescription>
            Describe what you want to write about. Be specific for better title suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Article Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Best content marketing strategies for 2024"
              value={articleData.topic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="text-base"
            />
          </div>
          
          <div>
            <Label htmlFor="keywords">Target Keywords (optional)</Label>
            <Input
              id="keywords"
              placeholder="e.g., content marketing, SEO, digital strategy"
              value={articleData.keywords.join(', ')}
              onChange={(e) => handleKeywordsChange(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
          </div>

          <div>
            <Label htmlFor="audience">Target Audience (optional)</Label>
            <Textarea
              id="audience"
              placeholder="e.g., Marketing professionals and business owners looking to improve their content strategy"
              value={articleData.audience}
              onChange={(e) => onUpdate({ audience: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Title Generation */}
      {articleData.topic && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  AI-Generated Titles
                </CardTitle>
                <CardDescription>
                  Choose from AI-generated titles or write your own
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateTitles}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isGenerating ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-3" />
                  <p className="text-gray-600">Generating titles with AI...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedTitles.map((title, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      articleData.selectedTitle === title
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleTitleSelect(title)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 flex-1">{title}</p>
                        {articleData.selectedTitle === title && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-3" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          SEO Score: {85 + index}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {title.length} chars
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setShowCustomTitle(!showCustomTitle)}
                  className="w-full flex items-center gap-2 mt-4"
                >
                  <PenTool className="w-4 h-4" />
                  Write my own title
                </Button>

                {showCustomTitle && (
                  <div className="mt-4">
                    <Label htmlFor="customTitle">Custom Title</Label>
                    <Input
                      id="customTitle"
                      placeholder="Enter your custom title..."
                      value={articleData.customTitle || ''}
                      onChange={(e) => handleCustomTitle(e.target.value)}
                      className="text-base"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {(articleData.selectedTitle || articleData.customTitle) && (
        <Card className="border-2 border-green-100 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Selected Title:</span>
            </div>
            <p className="text-green-900 font-medium">
              {articleData.customTitle || articleData.selectedTitle}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TitleGenerationStep;
