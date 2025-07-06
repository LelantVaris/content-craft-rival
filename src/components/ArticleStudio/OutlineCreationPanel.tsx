
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ArticleStudioData, OutlineSection } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OutlineCreationPanelProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
  getPrimaryKeyword: () => string;
  getSecondaryKeywords: () => string[];
  getTargetWordCount: () => number;
}

export const OutlineCreationPanel: React.FC<OutlineCreationPanelProps> = ({
  articleData,
  onUpdate,
  getPrimaryKeyword,
  getSecondaryKeywords,
  getTargetWordCount
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateOutline = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!title) {
      toast.error('Please select or enter a title first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          title,
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (error) throw error;
      onUpdate({ outline: data.sections || [] });
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Failed to generate outline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addSection = () => {
    const newSection: OutlineSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      characterCount: 0,
      expanded: true
    };
    onUpdate({ outline: [...articleData.outline, newSection] });
  };

  const updateSection = (id: string, updates: Partial<OutlineSection>) => {
    const updatedOutline = articleData.outline.map(section =>
      section.id === id
        ? { ...section, ...updates, characterCount: updates.content?.length || section.characterCount }
        : section
    );
    onUpdate({ outline: updatedOutline });
  };

  const removeSection = (id: string) => {
    onUpdate({ outline: articleData.outline.filter(section => section.id !== id) });
  };

  const toggleExpanded = (id: string) => {
    updateSection(id, { expanded: !articleData.outline.find(s => s.id === id)?.expanded });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            Article Outline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateOutline}
            disabled={isGenerating || (!articleData.selectedTitle && !articleData.customTitle)}
            className="w-full mb-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Outline...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Outline
              </>
            )}
          </Button>

          <div className="space-y-4">
            {articleData.outline.map((section, index) => (
              <Card key={section.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(section.id)}
                      >
                        {section.expanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <Badge variant="outline">Section {index + 1}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Section title..."
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="font-medium"
                  />
                </CardHeader>
                
                {section.expanded && (
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="Describe what this section will cover..."
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      className="min-h-[80px]"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {section.characterCount} characters
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            <Button
              onClick={addSection}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
