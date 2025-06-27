
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NovelEditor } from '@/components/NovelEditor';
import { Save, Eye, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleEditorWithNovelProps {
  title: string;
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  isAutoSaving?: boolean;
  wordCount?: number;
  readingTime?: number;
}

export const ArticleEditorWithNovel: React.FC<ArticleEditorWithNovelProps> = ({
  title,
  content,
  onContentChange,
  onSave,
  isAutoSaving = false,
  wordCount = 0,
  readingTime = 0
}) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save effect
  useEffect(() => {
    if (isAutoSaving && content.trim().length > 0) {
      const timer = setTimeout(() => {
        setLastSaved(new Date());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, isAutoSaving]);

  const handleManualSave = useCallback(() => {
    if (onSave) {
      onSave();
      setLastSaved(new Date());
      toast.success('Article saved successfully');
    }
  }, [onSave]);

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins === 0) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            Article Editor
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
            <Button
              onClick={handleManualSave}
              disabled={!content.trim()}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Rich Text Editor</Badge>
            <Badge variant="outline">Auto-save enabled</Badge>
          </div>
          {lastSaved && (
            <span className="text-muted-foreground">
              Last saved: {formatLastSaved(lastSaved)}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-4">
        {title && (
          <div className="mb-4 pb-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
          </div>
        )}
        
        <div className="h-full">
          <NovelEditor
            content={content}
            onChange={onContentChange}
            className="h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
