
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, PenTool, Zap } from 'lucide-react';
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

  const handleGenerateContent = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!title || articleData.outline.length === 0) {
      toast.error('Please complete the title and outline first');
      return;
    }

    setIsGeneratingContent(true);
    setIsGenerating(true);
    setStreamingContent('');

    try {
      // Simulate streaming by showing progressive content
      setStreamingContent('# Generating your article...\n\n*Searching the web for latest information...*');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStreamingContent('# Generating your article...\n\n*Analyzing your outline...*\n\n*Creating engaging introduction...*');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStreamingContent('# Generating your article...\n\n*Writing main content sections...*\n\n*Optimizing for SEO...*');

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

      if (error) throw error;
      
      const generatedContent = data.content || '';
      onUpdate({ generatedContent });
      setStreamingContent(generatedContent);
      
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
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
            <Select value={writingStyle} onValueChange={setWritingStyle}>
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
            <Select value={tone} onValueChange={setTone}>
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

          <Button
            onClick={handleGenerateContent}
            disabled={isGeneratingContent || articleData.outline.length === 0}
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
