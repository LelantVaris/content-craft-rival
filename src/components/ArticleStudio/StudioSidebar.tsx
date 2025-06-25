
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Home, Settings, HelpCircle } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';

interface StudioSidebarProps {
  articleData: ArticleStudioData;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  isGenerating: boolean;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  articleData,
  onNext,
  onPrev,
  canProceed,
  isGenerating
}) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Article Studio</h3>
        <p className="text-sm text-gray-600 mt-1">Create your content</p>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Step:</span>
                <span className="font-medium">{articleData.currentStep}/3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className={`font-medium ${
                  articleData.selectedTitle || articleData.customTitle ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {articleData.selectedTitle || articleData.customTitle ? 'Set' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outline:</span>
                <span className={`font-medium ${
                  articleData.outline.length > 0 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {articleData.outline.length > 0 ? `${articleData.outline.length} sections` : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Content:</span>
                <span className={`font-medium ${
                  articleData.generatedContent ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {articleData.generatedContent ? 'Generated' : 'Pending'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={articleData.currentStep === 1 || isGenerating}
          className="w-full justify-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed || isGenerating || articleData.currentStep === 3}
          className="w-full justify-start"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
