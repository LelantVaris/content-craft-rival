
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Target, FileText, Sparkles } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
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
      {/* Title Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Article Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={articleData.customTitle || articleData.selectedTitle}
            onChange={(e) => updateArticleData({ customTitle: e.target.value })}
            placeholder="Enter your article title..."
            className="text-lg"
          />
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
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              value={articleData.audience}
              onChange={(e) => updateArticleData({ audience: e.target.value })}
              placeholder="e.g., marketing professionals, small business owners"
            />
          </div>
          
          <div>
            <Label>Keywords</Label>
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
