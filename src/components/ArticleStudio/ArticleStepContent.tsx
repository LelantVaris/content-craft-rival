
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Sparkles, Download, Eye } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';

interface ArticleStepContentProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onSaveAndComplete: () => Promise<void>;
}

export const ArticleStepContent: React.FC<ArticleStepContentProps> = ({
  articleData,
  streamingContent,
  isGenerating,
  onGenerate,
  onSaveAndComplete
}) => {
  const finalTitle = articleData.customTitle || articleData.selectedTitle;
  const finalContent = streamingContent || articleData.generatedContent;
  const progress = isGenerating ? 45 : finalContent ? 100 : 0;

  const formatContent = (rawContent: string) => {
    if (!rawContent) return '';
    
    return rawContent
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-gray-700">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Article</h2>
        <p className="text-gray-600">AI will create your article based on the title and outline</p>
      </div>

      {!finalContent && !isGenerating && (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-4">Ready to Generate</h3>
            <p className="text-gray-600 mb-6">
              Click below to start generating your article content using AI
            </p>
            <Button
              onClick={onGenerate}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Article
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Generating Your Article</h3>
              <p className="text-gray-600">AI is writing your content...</p>
            </div>
            <Progress value={progress} className="mb-4" />
            <p className="text-sm text-gray-500 text-center">{progress}% complete</p>
          </CardContent>
        </Card>
      )}

      {(finalContent || streamingContent) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Article Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-auto">
                <div className="prose max-w-none">
                  {finalTitle && (
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">
                      {finalTitle}
                    </h1>
                  )}
                  
                  {finalContent ? (
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(finalContent) }}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your article content will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Article Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Words:</span>
                  <span className="font-medium">{finalContent ? finalContent.split(' ').length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Characters:</span>
                  <span className="font-medium">{finalContent ? finalContent.length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{articleData.outline.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={onSaveAndComplete}
                  disabled={!finalContent || isGenerating}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save & Complete
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Export as Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
