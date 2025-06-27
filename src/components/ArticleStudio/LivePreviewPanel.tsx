
import React from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { StreamingArticlePreview } from './StreamingArticlePreview';
import { LiveArticleStats } from './LiveArticleStats';
import { RealtimeSEOPanel } from './RealtimeSEOPanel';
import { EnhancedPublishingOptions } from './EnhancedPublishingOptions';

interface LivePreviewPanelProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  streamingStatus?: any;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  articleData,
  streamingContent,
  saveAndComplete,
  isGenerating,
  streamingStatus
}) => {
  const finalTitle = articleData.customTitle || articleData.selectedTitle;
  const finalContent = streamingContent || articleData.generatedContent;

  return (
    <div className="p-4 space-y-4 h-full">
      {/* Live Statistics Bar */}
      <LiveArticleStats
        title={finalTitle}
        content={finalContent}
        keywords={articleData.keywords}
        isGenerating={isGenerating}
      />
      
      {/* Main Article Preview */}
      <div className="flex-1 min-h-0">
        <StreamingArticlePreview
          title={finalTitle}
          content={finalContent}
          isGenerating={isGenerating}
          streamingContent={streamingContent}
          streamingStatus={streamingStatus}
        />
      </div>
      
      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RealtimeSEOPanel
          title={finalTitle}
          content={finalContent}
          keywords={articleData.keywords}
          targetAudience={articleData.audience}
        />
        
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
