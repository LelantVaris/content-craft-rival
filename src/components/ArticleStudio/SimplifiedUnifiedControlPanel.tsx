
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  PenTool, 
  Lightbulb, 
  Zap, 
  Sparkles, 
  Target,
  Users,
  Hash,
  Settings,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimplifiedUnifiedControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
}

export const SimplifiedUnifiedControlPanel: React.FC<SimplifiedUnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  setStreamingContent,
  setIsGenerating
}) => {
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState(articleData.customTitle || '');

  const handleTopicChange = (topic: string) => {
    updateArticleData({ topic });
    // Clear previous suggestions when topic changes
    setSuggestedTitles([]);
  };

  const generateTitles = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGeneratingTitles(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-titles', {
        body: { 
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (error) throw error;
      
      setSuggestedTitles(data.titles || []);
      toast.success('Titles generated successfully!');
    } catch (error) {
      console.error('Error generating titles:', error);
      toast.error('Failed to generate titles');
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const generateAudience = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGeneratingAudience(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audience', {
        body: { topic: articleData.topic }
      });

      if (error) throw error;
      
      updateArticleData({ audience: data.audience });
      toast.success('Audience generated successfully!');
    } catch (error) {
      console.error('Error generating audience:', error);
      toast.error('Failed to generate audience');
    } finally {
      setIsGeneratingAudience(false);
    }
  };

  const generateKeywords = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGeneratingKeywords(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: { 
          topic: articleData.topic,
          audience: articleData.audience
        }
      });

      if (error) throw error;
      
      updateArticleData({ keywords: data.keywords || [] });
      toast.success('Keywords generated successfully!');
    } catch (error) {
      console.error('Error generating keywords:', error);
      toast.error('Failed to generate keywords');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const generateBasicArticle = async () => {
    const title = customTitle || articleData.selectedTitle;
    if (!title.trim()) {
      toast.error('Please select or enter a title first');
      return;
    }

    setIsGeneratingArticle(true);
    setIsGenerating(true);
    setStreamingContent('');

    try {
      // First, generate an outline
      const { data: outlineData, error: outlineError } = await supabase.functions.invoke('generate-outline', {
        body: {
          title,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (outlineError) throw outlineError;

      // Update with generated outline
      updateArticleData({ outline: outlineData.outline || [] });

      // Then generate the basic article content
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          outline: outlineData.outline || [],
          keywords: articleData.keywords,
          audience: articleData.audience,
          tone: 'professional'
        }
      });

      if (error) throw error;

      const generatedContent = data.content || '';
      updateArticleData({ 
        generatedContent,
        selectedTitle: title,
        customTitle: customTitle
      });
      setStreamingContent(generatedContent);
      
      toast.success('Article generated successfully!');
    } catch (error) {
      console.error('Error generating article:', error);
      toast.error('Failed to generate article');
      setStreamingContent('');
    } finally {
      setIsGeneratingArticle(false);
      setIsGenerating(false);
    }
  };

  const handleTitleSelect = (title: string) => {
    updateArticleData({ selectedTitle: title });
    setCustomTitle('');
  };

  const handleCustomTitleChange = (title: string) => {
    setCustomTitle(title);
    updateArticleData({ customTitle: title, selectedTitle: '' });
  };

  const canGenerateArticle = () => {
    return !!(customTitle.trim() || articleData.selectedTitle.trim());
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Article Setup & Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Topic / Subject
          </Label>
          <Textarea
            id="topic"
            placeholder="Enter your article topic or subject..."
            value={articleData.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Separator />

        {/* AI Title Generation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Title Generation
            </Label>
            <Button
              onClick={generateTitles}
              disabled={!articleData.topic.trim() || isGeneratingTitles}
              size="sm"
              variant="outline"
            >
              {isGeneratingTitles ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>

          {suggestedTitles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Generated Titles:</Label>
              <div className="space-y-2">
                {suggestedTitles.map((title, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      articleData.selectedTitle === title
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleTitleSelect(title)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{title}</span>
                      {articleData.selectedTitle === title && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customTitle">Or Enter Custom Title:</Label>
            <Input
              id="customTitle"
              placeholder="Enter your custom title..."
              value={customTitle}
              onChange={(e) => handleCustomTitleChange(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* AI Audience Generation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Target Audience
            </Label>
            <Button
              onClick={generateAudience}
              disabled={!articleData.topic.trim() || isGeneratingAudience}
              size="sm"
              variant="outline"
            >
              {isGeneratingAudience ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>
          <Textarea
            placeholder="AI will generate target audience based on your topic..."
            value={articleData.audience}
            onChange={(e) => updateArticleData({ audience: e.target.value })}
            className="min-h-[60px]"
          />
        </div>

        <Separator />

        {/* AI Keywords Generation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              SEO Keywords
            </Label>
            <Button
              onClick={generateKeywords}
              disabled={!articleData.topic.trim() || isGeneratingKeywords}
              size="sm"
              variant="outline"
            >
              {isGeneratingKeywords ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>
          
          {articleData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {articleData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
          
          <Input
            placeholder="Enter keywords separated by commas..."
            value={articleData.keywords.join(', ')}
            onChange={(e) => {
              const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
              updateArticleData({ keywords });
            }}
          />
        </div>

        <Separator />

        {/* Generate Article Button */}
        <div className="pt-4">
          <Button
            onClick={generateBasicArticle}
            disabled={!canGenerateArticle() || isGeneratingArticle}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGeneratingArticle ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Article...
              </>
            ) : (
              <>
                <PenTool className="w-5 h-5 mr-2" />
                Generate Article
              </>
            )}
          </Button>
          
          {!canGenerateArticle() && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Please select or enter a title to generate the article
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
