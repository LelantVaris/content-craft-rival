
import React, { useState, useCallback } from 'react';
import { NovelEditor } from '@/components/NovelEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Zap, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArticleEditorWithNovelProps {
  title: string;
  content: string;
  outline: any[];
  keywords: string[];
  audience: string;
  onContentChange: (content: string) => void;
  onEnhance?: () => void;
}

export const ArticleEditorWithNovel: React.FC<ArticleEditorWithNovelProps> = ({
  title,
  content,
  outline,
  keywords,
  audience,
  onContentChange,
  onEnhance
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementStatus, setEnhancementStatus] = useState<string>('');

  const generateBasicArticle = useCallback(async () => {
    if (!title || outline.length === 0) {
      toast.error('Please complete title and outline first');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating basic article...');
      
      const { data, error } = await supabase.functions.invoke('generate-enhanced-article', {
        body: {
          title,
          outline,
          keywords,
          audience,
          tone: 'professional'
        }
      });

      if (error) {
        console.error('Generation error:', error);
        throw new Error(error.message || 'Failed to generate article');
      }

      if (data?.generatedText) {
        onContentChange(data.generatedText);
        toast.success('Basic article generated successfully!');
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating article:', error);
      toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [title, outline, keywords, audience, onContentChange]);

  const enhanceArticle = useCallback(async () => {
    if (!content) {
      toast.error('Generate basic article first');
      return;
    }

    setIsEnhancing(true);
    setEnhancementStatus('Starting enhancement...');

    try {
      console.log('Enhancing article with research...');
      
      // Use the enhanced content generation with research
      const { data, error } = await supabase.functions.invoke('generate-enhanced-content', {
        body: {
          title,
          outline,
          keywords,
          audience,
          tone: 'professional'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to enhance article');
      }

      if (data?.content) {
        onContentChange(data.content);
        toast.success('Article enhanced with research!');
      }
    } catch (error) {
      console.error('Error enhancing article:', error);
      toast.error(`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEnhancing(false);
      setEnhancementStatus('');
    }
  }, [content, title, outline, keywords, audience, onContentChange]);

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
      <p className="text-gray-500 mb-6">
        Click "Generate Article" to create your initial draft
      </p>
      <Button 
        onClick={generateBasicArticle}
        disabled={isGenerating || !title || outline.length === 0}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Article
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Article Editor
          </div>
          <div className="flex items-center gap-2">
            {content && (
              <Button
                onClick={enhanceArticle}
                disabled={isEnhancing}
                variant="outline"
                size="sm"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Enhance with Research
                  </>
                )}
              </Button>
            )}
            {(isGenerating || isEnhancing) && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Working...
              </Badge>
            )}
          </div>
        </CardTitle>
        {enhancementStatus && (
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            {enhancementStatus}
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] p-0">
        {!content ? (
          renderEmptyState()
        ) : (
          <div className="h-full">
            <NovelEditor
              content={content}
              onChange={onContentChange}
              className="h-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
