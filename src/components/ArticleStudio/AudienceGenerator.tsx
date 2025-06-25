
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wand2 } from 'lucide-react';

interface AudienceGeneratorProps {
  audience: string;
  onAudienceChange: (audience: string) => void;
  onGenerateAudience: () => Promise<void>;
  isGenerating: boolean;
  hasTopic: boolean;
}

export const AudienceGenerator: React.FC<AudienceGeneratorProps> = ({
  audience,
  onAudienceChange,
  onGenerateAudience,
  isGenerating,
  hasTopic
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="audience">Target Audience</Label>
      <div className="flex gap-2">
        <Textarea
          id="audience"
          placeholder="e.g., Marketing professionals and business owners looking to improve their content strategy"
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value)}
          rows={2}
          className="resize-none flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateAudience}
          disabled={isGenerating || !hasTopic}
          className="flex items-center gap-2 shrink-0"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          AI Generate
        </Button>
      </div>
    </div>
  );
};
