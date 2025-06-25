
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';

interface ArticlePreviewProps {
  title: string;
  content: string;
  isGenerating: boolean;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  title,
  content,
  isGenerating
}) => {
  const formatContent = (rawContent: string) => {
    if (!rawContent) return '';
    
    // Simple markdown-like formatting
    return rawContent
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2 text-gray-700">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  return (
    <Card className="h-[400px] overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-blue-600" />
          Article Preview
          {isGenerating && (
            <Badge variant="secondary" className="ml-2">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] overflow-auto">
        <div className="prose prose-sm max-w-none">
          {title && (
            <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
              {title}
            </h1>
          )}
          
          {content ? (
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your article content will appear here as you create it</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
