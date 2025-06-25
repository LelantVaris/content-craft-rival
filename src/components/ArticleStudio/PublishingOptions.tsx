
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Upload, Calendar } from 'lucide-react';

interface PublishingOptionsProps {
  onSave: () => Promise<void>;
  disabled: boolean;
}

export const PublishingOptions: React.FC<PublishingOptionsProps> = ({
  onSave,
  disabled
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="w-5 h-5 text-green-600" />
          Publishing Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="save-draft" defaultChecked />
            <label htmlFor="save-draft" className="text-sm">
              Save as draft
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="publish-blog" />
            <label htmlFor="publish-blog" className="text-sm">
              Publish to blog
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="schedule-later" />
            <label htmlFor="schedule-later" className="text-sm">
              Schedule for later
            </label>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={onSave}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
