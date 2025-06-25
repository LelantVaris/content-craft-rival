
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, Download, Globe, Loader2 } from 'lucide-react';

interface EnhancedPublishingOptionsProps {
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  disabled: boolean;
  isGenerating: boolean;
}

export const EnhancedPublishingOptions: React.FC<EnhancedPublishingOptionsProps> = ({
  onSave,
  onPublish,
  disabled,
  isGenerating
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Send className="w-4 h-4 text-blue-600" />
          Publishing Options
          {isGenerating && (
            <Badge variant="secondary" className="ml-auto">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onSave}
          disabled={disabled}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>

        <Button
          onClick={onPublish}
          disabled={disabled}
          className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Publish Article
        </Button>

        <div className="border-t pt-3 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600"
            disabled
          >
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
            <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600"
            disabled
          >
            <Globe className="w-4 h-4 mr-2" />
            Webflow Integration
            <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
          <p>💡 <strong>Tip:</strong> Your article auto-saves as you work. Use "Save as Draft" to finalize your changes.</p>
        </div>
      </CardContent>
    </Card>
  );
};
