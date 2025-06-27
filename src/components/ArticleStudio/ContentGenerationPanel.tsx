
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, PenTool, Zap, AlertCircle } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentGenerationPanelProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
  onComplete: () => Promise<void>;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
}

export const ContentGenerationPanel: React.FC<ContentGenerationPanelProps> = ({
  articleData,
  onUpdate,
  onComplete,
  setStreamingContent,
  setIsGenerating
}) => {
  const [writingStyle, setWritingStyle] = useState('professional');
  const [tone, setTone] = useState('informative');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const canGenerate = () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    return title && articleData.outline.length > 0;
  };

  const handleGenerateContent = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!canGenerate()) {
      toast.error('Please complete the title and outline first');
      return;
    }

    setIsGeneratingContent(true);
    setIsGenerating(true);
    setStreamingContent('');
    setGenerationError(null);

    try {
      // Show progressive loading states
      setStreamingContent('# Initializing content generation...\n\n*Analyzing your requirements...*');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setStreamingContent('# Preparing content structure...\n\n*Processing outline and keywords...*\n\n*Optimizing for SEO...*');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setStreamingContent('# Generating content...\n\n*Writing introduction...*\n\n*Developing main sections...*\n\n*This may take a moment...*');

      console.log('Calling generate-content function with:', {
        title,
        outline: articleData.outline,
        keywords: articleData.keywords,
        audience: articleData.audience,
        writingStyle,
        tone
      });

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience,
          writingStyle,
          tone
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }
      
      const generatedContent = data?.content || '';
      
      if (!generatedContent) {
        throw new Error('No content was generated');
      }
      
      // Simulate streaming effect for better UX
      setStreamingContent('# Content generation complete!\n\n*Finalizing your article...*');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onUpdate({ generatedContent });
      setStreamingContent(generatedContent);
      
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      toast.error(`Failed to generate content: ${errorMessage}`);
      setStreamingContent('');
    } finally {
      setIsGeneratingContent(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="w-5 h-5 text-green-600" />
            Content Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="writing-style">Writing Style</Label>
            <Select value={writingStyle} onValueChange={setWritingStyle} disabled={isGeneratingContent}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select writing style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone} disabled={isGeneratingContent}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {generationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation Failed</p>
                <p className="text-xs text-red-600 mt-1">{generationError}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerateContent}
            disabled={isGeneratingContent || !canGenerate()}
            className="w-full"
          >
            {isGeneratingContent ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {!canGenerate() && (
            <p className="text-xs text-gray-500 text-center">
              Complete title and outline steps to enable content generation
            </p>
          )}
        </CardContent>
      </Card>

      {articleData.generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="w-5 h-5 text-green-600" />
              Ready to Create
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your article content has been generated! Click "Create Article" to save it and continue editing.
            </p>
            <Button
              onClick={onComplete}
              disabled={isGeneratingContent}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
