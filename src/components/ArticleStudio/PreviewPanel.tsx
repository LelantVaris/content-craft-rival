
import React from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { ArticlePreview } from './ArticlePreview';
import { ArticleStats } from './ArticleStats';
import { PublishingOptions } from './PublishingOptions';

interface PreviewPanelProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  articleData,
  streamingContent,
  saveAndComplete,
  isGenerating
}) => {
  const finalTitle = articleData.customTitle || articleData.selectedTitle;
  const finalContent = streamingContent || articleData.generatedContent;

  return (
    <div className="space-y-6">
      <ArticleStats
        title={finalTitle}
        content={finalContent}
        keywords={articleData.keywords}
      />
      
      <ArticlePreview
        title={finalTitle}
        content={finalContent}
        isGenerating={isGenerating}
      />
      
      <PublishingOptions
        onSave={saveAndComplete}
        disabled={!finalTitle || isGenerating}
      />
    </div>
  );
};
