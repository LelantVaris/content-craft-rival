
import React from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { ArticleEditorWithNovel } from './ArticleEditorWithNovel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Save, Hash, Users, FileText } from 'lucide-react';

interface SimplifiedLivePreviewPanelProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  setStreamingContent: (content: string) => void;
}

export const SimplifiedLivePreviewPanel: React.FC<SimplifiedLivePreviewPanelProps> = ({
  articleData,
  streamingContent,
  updateArticleData,
  saveAndComplete,
  isGenerating,
  setStreamingContent
}) => {
  const finalTitle = articleData.customTitle || articleData.selectedTitle;
  const finalContent = streamingContent || articleData.generatedContent;
  
  // Calculate word count and reading time
  const wordCount = finalContent.trim() ? finalContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleContentChange = (newContent: string) => {
    setStreamingContent(newContent);
    updateArticleData({ generatedContent: newContent });
  };

  const handleSave = async () => {
    updateArticleData({ generatedContent: finalContent });
    await saveAndComplete();
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Article Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5 text-green-600" />
            Article Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{wordCount}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{readingTime}</div>
              <div className="text-sm text-muted-foreground">Min Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{articleData.keywords.length}</div>
              <div className="text-sm text-muted-foreground">Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {finalTitle ? '✓' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">Title Set</div>
            </div>
          </div>

          {/* SEO Info */}
          {(articleData.audience || articleData.keywords.length > 0) && (
            <div className="mt-4 pt-4 border-t space-y-2">
              {articleData.audience && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <Badge variant="outline">{articleData.audience}</Badge>
                </div>
              )}
              {articleData.keywords.length > 0 && (
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {articleData.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {articleData.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{articleData.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Editor */}
      <div className="flex-1 min-h-0">
        {finalTitle ? (
          <ArticleEditorWithNovel
            title={finalTitle}
            content={finalContent}
            onContentChange={handleContentChange}
            onSave={handleSave}
            isAutoSaving={true}
            wordCount={wordCount}
            readingTime={readingTime}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center space-y-4">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Ready to Create
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Set up your article details and generate content to start editing
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      {finalContent && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isGenerating || !finalTitle}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Complete Article
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
