
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
  RotateCcw
} from 'lucide-react';
import { ArticleData } from './EnhancedArticleWizard';

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

  const generationPhases = [
    { phase: 'Analyzing your outline...', duration: 1000 },
    { phase: 'Searching the web for latest insights...', duration: 2000 },
    { phase: 'Gathering relevant information...', duration: 1500 },
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
    setIsGenerating(true);
    setGenerationProgress(0);
    
    let totalProgress = 0;
    
    for (let i = 0; i < generationPhases.length; i++) {
      const phase = generationPhases[i];
      setCurrentPhase(phase.phase);
      
      await new Promise(resolve => setTimeout(resolve, phase.duration));
      
      totalProgress = ((i + 1) / generationPhases.length) * 100;
      setGenerationProgress(totalProgress);
    }

    // Generate sample content based on the outline
    const sampleContent = generateSampleContent();
    onUpdate({ generatedContent: sampleContent });
    
    setIsGenerating(false);
    setCurrentPhase('Content generation complete!');
  };

  const generateSampleContent = () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    
    return `# ${title}

## Introduction

Content marketing has become the cornerstone of successful digital strategies in 2024. As businesses compete for attention in an increasingly crowded digital landscape, the need for high-quality, engaging content has never been more critical. This comprehensive guide will walk you through the essential strategies and techniques that are driving real results for businesses today.

## Understanding Content Marketing Fundamentals

Content marketing is more than just creating blog posts and social media updates. It's a strategic approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience. The goal is to drive profitable customer action through content that educates, entertains, or inspires.

### Key Principles of Modern Content Marketing

1. **Audience-First Approach**: Understanding your audience's needs, challenges, and preferences
2. **Value Creation**: Providing genuine value before asking for anything in return
3. **Consistency**: Maintaining regular publishing schedules and brand voice
4. **Multi-Channel Distribution**: Leveraging various platforms and formats

## Strategy Development

Creating a successful content marketing strategy requires careful planning and execution. Here's a step-by-step approach:

### 1. Define Your Goals
- Brand awareness
- Lead generation
- Customer retention
- Thought leadership

### 2. Identify Your Target Audience
- Demographics and psychographics
- Pain points and challenges
- Content consumption preferences
- Buyer journey mapping

### 3. Content Planning and Calendar
- Editorial calendar development
- Content themes and topics
- Format diversity (blog posts, videos, infographics, podcasts)
- Publishing frequency

## Content Creation Best Practices

Quality content is the foundation of successful content marketing. Here are proven techniques for creating content that resonates:

### Writing Compelling Headlines
- Use numbers and statistics
- Include power words
- Address specific pain points
- Keep it concise and clear

### Structuring Your Content
- Use clear headings and subheadings
- Include bullet points and lists
- Add visual elements
- Maintain scannable formatting

### Optimizing for SEO
- Keyword research and integration
- Meta descriptions and title tags
- Internal and external linking
- Image optimization

## Distribution and Promotion

Creating great content is only half the battle. Effective distribution ensures your content reaches the right audience:

### Owned Media Channels
- Company blog
- Email newsletters
- Website pages
- Mobile apps

### Earned Media
- Social media shares
- Guest posting
- Influencer partnerships
- PR and media coverage

### Paid Media
- Social media advertising
- Content promotion
- Native advertising
- PPC campaigns

## Measuring Success and ROI

To optimize your content marketing efforts, you need to track the right metrics:

### Key Performance Indicators
- Website traffic and engagement
- Lead generation and conversion rates
- Social media metrics
- Brand awareness measures

### Tools for Measurement
- Google Analytics
- Social media analytics
- Email marketing platforms
- CRM systems

## Conclusion and Next Steps

Content marketing success requires a strategic approach, consistent execution, and continuous optimization. By following the strategies outlined in this guide, you'll be well-equipped to create content that not only engages your audience but also drives meaningful business results.

### Immediate Action Steps:
1. Audit your current content marketing efforts
2. Define clear goals and KPIs
3. Create a content calendar for the next quarter
4. Implement measurement and tracking systems
5. Start creating valuable content consistently

Remember, content marketing is a long-term strategy that requires patience and persistence. Stay focused on providing value to your audience, and the results will follow.`;
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
