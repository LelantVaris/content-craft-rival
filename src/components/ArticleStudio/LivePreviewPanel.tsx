
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
  streamingStatus?: string;
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

  // Ensure streamingStatus is always a string
  const safeStreamingStatus = typeof streamingStatus === 'string' ? streamingStatus : '';

  // Conditional display logic based on content readiness
  const showStats = finalContent && finalContent.length > 500 && !isGenerating;
  const showSEO = finalContent && finalContent.length > 1000 && !isGenerating;
  const showPublishing = finalContent && finalContent.length > 800 && !isGenerating && finalTitle;

  return (
    <div className="p-4 space-y-4 h-full">
      {/* Live Statistics Bar - Only show when content is substantial */}
      {showStats && (
        <LiveArticleStats
          title={finalTitle}
          content={finalContent}
          keywords={articleData.keywords}
          isGenerating={isGenerating}
        />
      )}
      
      {/* Main Article Preview */}
      <div className="flex-1 min-h-0">
        <StreamingArticlePreview
          title={finalTitle}
          content={finalContent}
          isGenerating={isGenerating}
          streamingContent={streamingContent}
          streamingStatus={safeStreamingStatus}
        />
      </div>
      
      {/* Bottom panels - Only show when content is ready */}
      {(showSEO || showPublishing) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {showSEO && (
            <RealtimeSEOPanel
              title={finalTitle}
              content={finalContent}
              keywords={articleData.keywords}
              targetAudience={articleData.audience}
            />
          )}
          
          {showPublishing && (
            <EnhancedPublishingOptions
              onSave={saveAndComplete}
              onPublish={saveAndComplete}
              disabled={!finalTitle || isGenerating}
              isGenerating={isGenerating}
            />
          )}
        </div>
      )}
    </div>
  );
};
