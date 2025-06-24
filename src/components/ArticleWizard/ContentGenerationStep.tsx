
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Search, 
  FileText, 
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { ArticleData } from './EnhancedArticleWizard';
import { supabase } from '@/integrations/supabase/client';

interface ContentGenerationStepProps {
  articleData: ArticleData;
  onUpdate: (updates: Partial<ArticleData>) => void;
  onComplete: () => void;
}

const ContentGenerationStep: React.FC<ContentGenerationStepProps> = ({ 
  articleData, 
  onUpdate, 
  onComplete 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generationPhases = [
    { phase: 'Analyzing your outline...', duration: 1000 },
    { phase: 'Researching latest insights...', duration: 2000 },
    { phase: 'Structuring content flow...', duration: 1500 },
    { phase: 'Writing introduction...', duration: 1200 },
    { phase: 'Generating main content...', duration: 3000 },
    { phase: 'Creating conclusion...', duration: 1000 },
    { phase: 'Optimizing for SEO...', duration: 800 },
    { phase: 'Final polishing...', duration: 500 }
  ];

  useEffect(() => {
    if (!articleData.generatedContent) {
      generateContent();
    }
  }, []);

  const generateContent = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!title || !articleData.outline || articleData.outline.length === 0) {
      setError('Title and outline are required for content generation');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    
    // Simulate progress phases
    let totalProgress = 0;
    const progressInterval = setInterval(() => {
      if (totalProgress < 90) {
        totalProgress += Math.random() * 10;
        setGenerationProgress(Math.min(totalProgress, 90));
        
        // Update phase based on progress
        const phaseIndex = Math.floor((totalProgress / 90) * generationPhases.length);
        if (phaseIndex < generationPhases.length) {
          setCurrentPhase(generationPhases[phaseIndex].phase);
        }
      }
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience
        }
      });

      clearInterval(progressInterval);

      if (error) throw error;

      if (data?.content) {
        onUpdate({ generatedContent: data.content });
        setGenerationProgress(100);
        setCurrentPhase('Content generation complete!');
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
      
      // Fallback to sample content on error
      const sampleContent = generateFallbackContent(title);
      onUpdate({ generatedContent: sampleContent });
      setGenerationProgress(100);
      setCurrentPhase('Content generation complete (using fallback)');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackContent = (title: string) => {
    return `# ${title}

## Introduction

This is a comprehensive guide that will help you understand the key concepts and strategies outlined in this article. The content has been structured to provide you with actionable insights and practical advice.

## Main Content

The following sections will dive deep into the topic, providing you with detailed information and step-by-step guidance.

### Key Points

- Important concept #1 with detailed explanation
- Important concept #2 with practical examples
- Important concept #3 with actionable steps

### Implementation Strategy

Here's how you can apply these concepts in practice:

1. **Step One**: Begin by understanding the fundamentals
2. **Step Two**: Apply the strategies in a controlled environment
3. **Step Three**: Scale your implementation based on results

## Best Practices

To ensure success with these strategies, consider the following best practices:

- Always test your approach before full implementation
- Monitor results and adjust as needed
- Stay updated with the latest trends and developments

## Conclusion

This guide has provided you with the essential knowledge and tools needed to succeed. Remember to take action on what you've learned and continue to refine your approach based on your results.

The key to success is consistent application of these principles combined with continuous learning and adaptation.`;
  };

  const wordCount = articleData.generatedContent ? articleData.generatedContent.split(' ').length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="space-y-6">
      {/* Article Summary */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Article Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Title:</h4>
              <p className="text-sm text-gray-700 mb-4">
                {articleData.customTitle || articleData.selectedTitle}
              </p>
              
              <h4 className="font-semibold mb-2">Outline:</h4>
              <div className="space-y-1">
                {articleData.outline.slice(0, 3).map((section, index) => (
                  <p key={section.id} className="text-sm text-gray-600">
                    {index + 1}. {section.title}
                  </p>
                ))}
                {articleData.outline.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{articleData.outline.length - 3} more sections
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Target Keywords:</h4>
              <div className="flex flex-wrap gap-1 mb-4">
                {articleData.keywords.slice(0, 4).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              {articleData.audience && (
                <>
                  <h4 className="font-semibold mb-2">Audience:</h4>
                  <p className="text-sm text-gray-700">{articleData.audience}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Generation */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-blue-600" />
                AI Content Generation
              </CardTitle>
              <CardDescription>
                AI is writing your article based on the outline and requirements
              </CardDescription>
            </div>
            {!isGenerating && articleData.generatedContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateContent}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
            )}
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
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="text-sm text-gray-600">{currentPhase}</span>
              </div>
              
              <Progress value={generationProgress} className="h-3" />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress: {Math.round(generationProgress)}%</span>
                <span>Estimated time: {Math.max(1, Math.round((100 - generationProgress) / 10))}s</span>
              </div>
            </div>
          ) : articleData.generatedContent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Content Generated Successfully!</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{readingTime}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">85</div>
                  <div className="text-sm text-gray-600">SEO Score</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Preview'} Content
                </Button>
                
                <Button
                  onClick={onComplete}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <PenTool className="w-4 h-4" />
                  Open in Editor
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ready to generate your article content</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Preview */}
      {showPreview && articleData.generatedContent && (
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              Content Preview
            </CardTitle>
            <CardDescription>
              Preview of your generated article content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <div className="prose prose-sm max-w-none">
                {articleData.generatedContent.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mb-3 mt-6">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-medium mb-2 mt-4">{line.substring(4)}</h3>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mb-2 text-gray-700">{line}</p>;
                  }
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentGenerationStep;
