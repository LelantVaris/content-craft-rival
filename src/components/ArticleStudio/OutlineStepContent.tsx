
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, GripVertical } from 'lucide-react';
import { ArticleStudioData, OutlineSection } from '@/hooks/useArticleStudio';

interface OutlineStepContentProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
}

export const OutlineStepContent: React.FC<OutlineStepContentProps> = ({
  articleData,
  onUpdate
}) => {
  const addSection = () => {
    const newSection: OutlineSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      characterCount: 0,
      expanded: true
    };
    onUpdate({ outline: [...articleData.outline, newSection] });
  };

  const updateSection = (id: string, updates: Partial<OutlineSection>) => {
    const updatedOutline = articleData.outline.map(section =>
      section.id === id ? { ...section, ...updates } : section
    );
    onUpdate({ outline: updatedOutline });
  };

  const removeSection = (id: string) => {
    const updatedOutline = articleData.outline.filter(section => section.id !== id);
    onUpdate({ outline: updatedOutline });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Structure Your Article</h2>
        <p className="text-gray-600">Create an outline to organize your content</p>
      </div>

      <div className="space-y-4">
        {articleData.outline.map((section, index) => (
          <Card key={section.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <span className="text-sm font-semibold text-blue-600">Section {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Input
                  placeholder="Section title..."
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  className="font-medium"
                />
              </div>
              <div>
                <textarea
                  placeholder="Brief description of what this section will cover..."
                  value={section.content}
                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={addSection}
          variant="outline"
          className="w-full py-6 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Section
        </Button>
      </div>

      {articleData.outline.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Outline Summary</span>
            </div>
            <p className="text-blue-700 mt-2">
              Your article will have {articleData.outline.length} main sections
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
