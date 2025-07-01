
import React, { useState } from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { StreamingArticlePreview } from './StreamingArticlePreview';
import { LiveArticleStats } from './LiveArticleStats';
import { RealtimeSEOPanel } from './RealtimeSEOPanel';
import { EnhancedPublishingOptions } from './EnhancedPublishingOptions';
import { EmptyStateDisplay } from './EmptyStateDisplay';
import { TitleGenerationInput } from './TitleGenerationInput';
import { TitleSelectionPanel } from './TitleSelectionPanel';

interface LivePreviewPanelProps {
  articleData: ArticleStudioData;
  streamingContent: string;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  streamingStatus?: string;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  articleData,
  streamingContent,
  saveAndComplete,
  isGenerating,
  streamingStatus,
  updateArticleData
}) => {
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  
  const finalTitle = articleData.customTitle || articleData.selectedTitle;
  const finalContent = streamingContent || articleData.generatedContent;
  const safeStreamingStatus = typeof streamingStatus === 'string' ? streamingStatus : '';

  // Progressive display logic
  const hasTopic = !!articleData.topic;
  const hasGeneratedTitles = generatedTitles.length > 0;
  const hasSelectedTitle = !!finalTitle;
  const hasContent = !!finalContent;

  // Conditional display logic based on content readiness
  const showStats = finalContent && finalContent.length > 500 && !isGenerating;
  const showSEO = finalContent && finalContent.length > 800 && !isGenerating;
  const showPublishing = finalContent && finalContent.length > 600 && !isGenerating && finalTitle;

  const handleTryExample = (topic: string) => {
    updateArticleData({ topic });
  };

  const handleTitlesGenerated = (titles: string[]) => {
    setGeneratedTitles(titles);
  };

  const handleTitleSelect = (title: string) => {
    updateArticleData({ selectedTitle: title });
  };

  const renderContent = () => {
    // Step 1: Empty state when no topic
    if (!hasTopic) {
      return (
        <div className="flex items-center justify-center h-full">
          <EmptyStateDisplay onTryExample={handleTryExample} />
        </div>
      );
    }

    // Step 2: Title generation input when topic exists but no titles generated
    if (hasTopic && !hasGeneratedTitles) {
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="w-full max-w-md">
            <TitleGenerationInput
              topic={articleData.topic}
              keywords={articleData.keywords}
              audience={articleData.audience}
              onTitlesGenerated={handleTitlesGenerated}
            />
          </div>
        </div>
      );
    }

    // Step 3: Title selection when titles are generated but none selected
    if (hasGeneratedTitles && !hasSelectedTitle) {
      return (
        <div className="p-6">
          <TitleSelectionPanel
            generatedTitles={generatedTitles}
            selectedTitle={articleData.selectedTitle}
            onTitleSelect={handleTitleSelect}
          />
        </div>
      );
    }

    // Step 4: Article preview when title is selected
    if (hasSelectedTitle) {
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
    }

    return null;
  };

  return (
    <div className="h-full bg-gray-50/30">
      {renderContent()}
    </div>
  );
};
