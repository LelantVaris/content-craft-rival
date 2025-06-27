
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Target, FileText, Sparkles, RefreshCw, Zap, Lightbulb } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimplifiedUnifiedControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  onGenerateContent: () => void;
  isGenerating: boolean;
}

export const SimplifiedUnifiedControlPanel: React.FC<SimplifiedUnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  onGenerateContent,
  isGenerating
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [showTitleOptions, setShowTitleOptions] = useState(false);

  const addKeyword = () => {
    if (newKeyword.trim() && !articleData.keywords.includes(newKeyword.trim())) {
      updateArticleData({
        keywords: [...articleData.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateArticleData({
      keywords: articleData.keywords.filter(k => k !== keyword)
    });
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
          audience: articleData.audience,
          count: 5
        }
      });

      if (error) throw error;
      
      const titles = data.titles || [];
      setGeneratedTitles(titles);
      setShowTitleOptions(true);
      
      if (titles.length > 0) {
        toast.success(`Generated ${titles.length} title options`);
      }
    } catch (error) {
      console.error('Error generating titles:', error);
      toast.error('Failed to generate titles. Please try again.');
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
        body: {
          topic: articleData.topic
        }
      });

      if (error) throw error;
      
      if (data?.audience) {
        updateArticleData({ audience: data.audience });
        toast.success('Audience generated successfully');
      }
    } catch (error) {
      console.error('Error generating audience:', error);
      toast.error('Failed to generate audience. Please try again.');
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
          audience: articleData.audience || ''
        }
      });

      if (error) throw error;
      
      if (data?.keywords) {
        updateArticleData({ keywords: data.keywords });
        toast.success('Keywords generated successfully');
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
      toast.error('Failed to generate keywords. Please try again.');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const selectTitle = (title: string) => {
    updateArticleData({ selectedTitle: title, customTitle: '' });
    setShowTitleOptions(false);
    toast.success('Title selected');
  };

  const addOutlineSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: `Section ${articleData.outline.length + 1}`,
      content: 'Add description for this section...',
      characterCount: 0,
      expanded: true
    };
    updateArticleData({
      outline: [...articleData.outline, newSection]
    });
  };

  const updateOutlineSection = (id: string, updates: Partial<typeof articleData.outline[0]>) => {
    updateArticleData({
      outline: articleData.outline.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    });
  };

  const removeOutlineSection = (id: string) => {
    updateArticleData({
      outline: articleData.outline.filter(section => section.id !== id)
    });
  };

  const canGenerate = () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    return title && articleData.outline.length > 0;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Topic Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Article Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={articleData.topic}
            onChange={(e) => updateArticleData({ topic: e.target.value })}
            placeholder="e.g., Best content marketing strategies for B2B SaaS companies in 2024"
            className="min-h-[80px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Title Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Article Title
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={articleData.customTitle || articleData.selectedTitle}
              onChange={(e) => updateArticleData({ customTitle: e.target.value })}
              placeholder="Enter your article title or generate options..."
              className="text-lg"
            />
            <Button
              onClick={generateTitles}
              disabled={isGeneratingTitles || !articleData.topic.trim()}
              variant="outline"
              size="sm"
            >
              {isGeneratingTitles ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Generated Title Options */}
          {showTitleOptions && generatedTitles.length > 0 && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Generated Title Options:</Label>
              {generatedTitles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => selectTitle(title)}
                >
                  <span className="text-sm flex-1">{title}</span>
                  <Button size="sm" variant="ghost">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            SEO Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Button
                onClick={generateAudience}
                disabled={isGeneratingAudience || !articleData.topic.trim()}
                variant="outline"
                size="sm"
              >
                {isGeneratingAudience ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Input
              id="audience"
              value={articleData.audience}
              onChange={(e) => updateArticleData({ audience: e.target.value })}
              placeholder="e.g., marketing professionals, small business owners"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Keywords</Label>
              <Button
                onClick={generateKeywords}
                disabled={isGeneratingKeywords || !articleData.topic.trim()}
                variant="outline"
                size="sm"
              >
                {isGeneratingKeywords ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword..."
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {articleData.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outline Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Article Outline
            </div>
            <Button onClick={addOutlineSection} size="sm" variant="outline">
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Section
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {articleData.outline.map((section, index) => (
            <div key={section.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Section {index + 1}
                </span>
                <Button
                  onClick={() => removeOutlineSection(section.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={section.title}
                onChange={(e) => updateOutlineSection(section.id, { title: e.target.value })}
                placeholder="Section title..."
                className="mb-2"
              />
              <Textarea
                value={section.content}
                onChange={(e) => updateOutlineSection(section.id, { content: e.target.value })}
                placeholder="Section description..."
                rows={2}
              />
            </div>
          ))}
          
          {articleData.outline.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Add sections to create your article outline
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={onGenerateContent}
            disabled={!canGenerate() || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Generating Article...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Article
              </>
            )}
          </Button>
          
          {!canGenerate() && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Complete title and outline to generate article
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
