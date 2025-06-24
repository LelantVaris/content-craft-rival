import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  GripVertical,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ArticleData, OutlineSection } from './EnhancedArticleWizard';
import { supabase } from '@/integrations/supabase/client';

interface OutlineCreationStepProps {
  articleData: ArticleData;
  onUpdate: (updates: Partial<ArticleData>) => void;
}

const OutlineCreationStep: React.FC<OutlineCreationStepProps> = ({ articleData, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleData.outline.length === 0) {
      generateOutline();
    }
  }, []);

  const generateOutline = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!title && !articleData.topic) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          title: title || articleData.topic,
          topic: articleData.topic,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      if (error) throw error;

      if (data?.sections && Array.isArray(data.sections)) {
        onUpdate({ outline: data.sections });
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (err: any) {
      console.error('Error generating outline:', err);
      setError(err.message || 'Failed to generate outline. Please try again.');
      
      // Fallback to sample outline on error
      const sampleOutline: OutlineSection[] = [
        {
          id: '1',
          title: 'Introduction',
          content: 'Hook readers with a compelling opening that highlights the importance of the topic.',
          characterCount: 85,
          expanded: false
        },
        {
          id: '2',
          title: 'Understanding the Fundamentals',
          content: 'Define key concepts and explain core principles that readers need to know.',
          characterCount: 82,
          expanded: false
        },
        {
          id: '3',
          title: 'Step-by-Step Implementation',
          content: 'Detailed guide on how to implement the strategies discussed in the article.',
          characterCount: 87,
          expanded: false
        },
        {
          id: '4',
          title: 'Best Practices and Tips',
          content: 'Expert advice and proven techniques for getting the best results.',
          characterCount: 72,
          expanded: false
        },
        {
          id: '5',
          title: 'Common Mistakes to Avoid',
          content: 'Highlight pitfalls and challenges that readers should be aware of.',
          characterCount: 70,
          expanded: false
        },
        {
          id: '6',
          title: 'Conclusion and Next Steps',
          content: 'Summarize key takeaways and provide actionable next steps for readers.',
          characterCount: 78,
          expanded: false
        }
      ];
      
      onUpdate({ outline: sampleOutline });
    } finally {
      setIsGenerating(false);
    }
  };

  const addSection = () => {
    const newSection: OutlineSection = {
      id: Date.now().toString(),
      title: 'New Section',
      content: '',
      characterCount: 0,
      expanded: true
    };
    
    onUpdate({ 
      outline: [...articleData.outline, newSection] 
    });
  };

  const updateSection = (id: string, updates: Partial<OutlineSection>) => {
    const updatedOutline = articleData.outline.map(section => 
      section.id === id 
        ? { 
            ...section, 
            ...updates,
            characterCount: updates.content ? updates.content.length : section.characterCount
          }
        : section
    );
    
    onUpdate({ outline: updatedOutline });
  };

  const removeSection = (id: string) => {
    const updatedOutline = articleData.outline.filter(section => section.id !== id);
    onUpdate({ outline: updatedOutline });
  };

  const toggleExpanded = (id: string) => {
    updateSection(id, { 
      expanded: !articleData.outline.find(s => s.id === id)?.expanded 
    });
  };

  const totalCharacters = articleData.outline.reduce((sum, section) => sum + section.characterCount, 0);
  const estimatedWords = Math.round(totalCharacters / 5);
  const estimatedReadingTime = Math.max(1, Math.round(estimatedWords / 200));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Article Outline
              </CardTitle>
              <CardDescription>
                Structure your content with an AI-generated outline, then customize as needed
              </CardDescription>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>~{estimatedWords} words</div>
              <div>{estimatedReadingTime} min read</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{articleData.outline.length} sections</Badge>
              <Badge variant="outline">{totalCharacters} characters</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateOutline}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addSection}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Outline Sections */}
      {isGenerating ? (
        <Card className="p-8">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-3" />
            <p className="text-gray-600">Generating article outline...</p>
            <p className="text-sm text-gray-500 mt-1">Creating structured sections for your article</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {articleData.outline.map((section, index) => (
            <Card key={section.id} className="border-2 border-gray-200 hover:border-blue-300 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(section.id)}
                    className="p-1"
                  >
                    {section.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="font-semibold border-none p-0 bg-transparent text-base"
                    placeholder="Section title..."
                  />
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Badge variant="secondary" className="text-xs">
                      {section.characterCount} chars
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {section.expanded && (
                <CardContent className="pt-0">
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Describe what this section will cover..."
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Content description for this section</span>
                    <span>{section.content.length} / 200 chars</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {articleData.outline.length > 0 && (
        <Card className="border-2 border-green-100 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Outline Complete</h4>
                <p className="text-sm text-green-700">
                  Your article outline is ready with {articleData.outline.length} sections
                </p>
              </div>
              <div className="text-right text-sm text-green-700">
                <div className="font-medium">~{estimatedWords} words</div>
                <div>{estimatedReadingTime} minute read</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OutlineCreationStep;
