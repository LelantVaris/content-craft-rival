
import React from 'react';
import { Monitor } from 'lucide-react';
import { useArticleStudio } from '@/hooks/useArticleStudio';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopProgressBar } from '@/components/ArticleStudio/TopProgressBar';
import { StudioSidebar } from '@/components/ArticleStudio/StudioSidebar';
import { TitleStepContent } from '@/components/ArticleStudio/TitleStepContent';
import { OutlineStepContent } from '@/components/ArticleStudio/OutlineStepContent';
import { ArticleStepContent } from '@/components/ArticleStudio/ArticleStepContent';

const ArticleStudio = () => {
  const articleStudio = useArticleStudio();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Desktop Only
          </h2>
          <p className="text-gray-600 mb-6">
            Article Studio is optimized for desktop screens. Please use a desktop or laptop computer for the best experience.
          </p>
          <div className="text-sm text-gray-500">
            Minimum screen width: 768px
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (articleStudio.articleData.currentStep) {
      case 1:
        return (
          <TitleStepContent
            articleData={articleStudio.articleData}
            onUpdate={articleStudio.updateArticleData}
          />
        );
      case 2:
        return (
          <OutlineStepContent
            articleData={articleStudio.articleData}
            onUpdate={articleStudio.updateArticleData}
          />
        );
      case 3:
        return (
          <ArticleStepContent
            articleData={articleStudio.articleData}
            streamingContent={articleStudio.streamingContent}
            isGenerating={articleStudio.isGenerating}
            onGenerate={() => {
              // This would trigger content generation
              articleStudio.setIsGenerating(true);
              // Simulate content generation
              setTimeout(() => {
                articleStudio.updateArticleData({
                  generatedContent: `# ${articleStudio.articleData.customTitle || articleStudio.articleData.selectedTitle}\n\nThis is your generated article content based on the outline you created. The AI has crafted this content to match your specifications and provide value to your readers.\n\n## Introduction\n\nYour article begins here with an engaging introduction that hooks the reader and sets the stage for the valuable content that follows.\n\n## Main Content\n\nThe main body of your article contains detailed information, examples, and insights that deliver on the promise made in your title.\n\n## Conclusion\n\nA strong conclusion that summarizes key points and provides actionable next steps for your readers.`
                });
                articleStudio.setIsGenerating(false);
              }, 3000);
            }}
            onSaveAndComplete={articleStudio.saveAndComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-white w-full flex flex-col">
      <TopProgressBar currentStep={articleStudio.articleData.currentStep} />
      
      <div className="flex-1 flex overflow-hidden">
        <StudioSidebar
          articleData={articleStudio.articleData}
          onNext={articleStudio.nextStep}
          onPrev={articleStudio.prevStep}
          canProceed={articleStudio.canProceed()}
          isGenerating={articleStudio.isGenerating}
        />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderStepContent()}
        </main>
      </div>
    </div>
  );
};

export default ArticleStudio;
