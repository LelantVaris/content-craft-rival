
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
  RefreshCw
} from 'lucide-react';
import { ArticleData, OutlineSection } from './EnhancedArticleWizard';

interface OutlineCreationStepProps {
  articleData: ArticleData;
  onUpdate: (updates: Partial<ArticleData>) => void;
}

const OutlineCreationStep: React.FC<OutlineCreationStepProps> = ({ articleData, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (articleData.outline.length === 0) {
      generateOutline();
    }
  }, []);

  const generateOutline = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const sampleOutline: OutlineSection[] = [
        {
          id: '1',
          title: 'Introduction',
          content: 'Hook readers with a compelling opening that highlights the importance of content marketing in today\'s digital landscape.',
          characterCount: 125,
          expanded: false
        },
        {
          id: '2',
          title: 'Understanding Content Marketing Fundamentals',
          content: 'Define content marketing and explain its core principles. Cover the difference between traditional and modern approaches.',
          characterCount: 142,
          expanded: false
        },
        {
          id: '3',
          title: 'Strategy Development',
          content: 'Step-by-step guide to creating a content marketing strategy, including audience research, goal setting, and content planning.',
          characterCount: 138,
          expanded: false
        },
        {
          id: '4',
          title: 'Content Creation Best Practices',
          content: 'Detailed tips for creating high-quality content that engages audiences and drives conversions.',
          characterCount: 108,
          expanded: false
        },
        {
          id: '5',
          title: 'Distribution and Promotion',
          content: 'How to effectively distribute and promote your content across multiple channels for maximum reach.',
          characterCount: 112,
          expanded: false
        },
        {
          id: '6',
          title: 'Measuring Success and ROI',
          content: 'Key metrics to track, tools to use, and how to calculate the return on investment of your content marketing efforts.',
          characterCount: 134,
          expanded: false
        },
        {
          id: '7',
          title: 'Conclusion and Next Steps',
          content: 'Summarize key takeaways and provide actionable next steps for readers to implement their content marketing strategy.',
          characterCount: 136,
          expanded: false
        }
      ];
      
      onUpdate({ outline: sampleOutline });
      setIsGenerating(false);
    }, 2500);
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
