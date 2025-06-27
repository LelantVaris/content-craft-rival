
import React from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { ArticleEditorWithNovel } from './ArticleEditorWithNovel';
import { LiveArticleStats } from './LiveArticleStats';
import { EnhancedPublishingOptions } from './EnhancedPublishingOptions';

interface SimplifiedLivePreviewPanelProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  setStreamingContent: (content: string) => void;
}

export const SimplifiedLivePreviewPanel: React.FC<SimplifiedLivePreviewPanelProps> = ({
  articleData,
  streamingContent,
  saveAndComplete,
  isGenerating,
  setStreamingContent
}) => {
  const finalTitle = articleData.customTitle || articleData.selectedTitle;
  const finalContent = streamingContent || articleData.generatedContent;

  const handleContentChange = (content: string) => {
    setStreamingContent(content);
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Live Statistics Bar */}
      <LiveArticleStats
        title={finalTitle}
        content={finalContent}
        keywords={articleData.keywords}
        isGenerating={isGenerating}
      />
      
      {/* Main Article Editor */}
      <div className="flex-1 min-h-0">
        <ArticleEditorWithNovel
          title={finalTitle}
          content={finalContent}
          outline={articleData.outline}
          keywords={articleData.keywords}
          audience={articleData.audience}
          onContentChange={handleContentChange}
        />
      </div>
      
      {/* Publishing Options */}
      <div className="flex-shrink-0">
        <EnhancedPublishingOptions
          onSave={saveAndComplete}
          onPublish={saveAndComplete}
          disabled={!finalTitle || isGenerating}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};
