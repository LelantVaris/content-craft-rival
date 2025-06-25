
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Lightbulb } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';

interface TitleStepContentProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
}

export const TitleStepContent: React.FC<TitleStepContentProps> = ({
  articleData,
  onUpdate
}) => {
  const suggestedTitles = [
    "10 Essential Tips for Modern Web Development",
    "The Complete Guide to React Best Practices",
    "How to Build Scalable Applications in 2024",
    "Advanced TypeScript Patterns Every Developer Should Know"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Article Title</h2>
        <p className="text-gray-600">Select from AI-generated suggestions or create your own</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Generated Titles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedTitles.map((title, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm ${
                articleData.selectedTitle === title ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => onUpdate({ selectedTitle: title })}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{title}</span>
                <Button
                  variant={articleData.selectedTitle === title ? "default" : "outline"}
                  size="sm"
                >
                  {articleData.selectedTitle === title ? "Selected" : "Select"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-600" />
            Custom Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-title">Enter your own title</Label>
              <Input
                id="custom-title"
                placeholder="Write your custom article title..."
                value={articleData.customTitle || ''}
                onChange={(e) => onUpdate({ customTitle: e.target.value })}
                className="mt-2"
              />
            </div>
            {articleData.customTitle && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">Custom title preview:</p>
                <p className="text-green-700 mt-1">{articleData.customTitle}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
