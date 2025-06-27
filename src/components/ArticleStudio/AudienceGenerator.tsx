
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  isGenerating,
  hasTopic
}) => {
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  const handleGenerateAudience = async () => {
    if (!hasTopic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsLocalGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audience', {
        body: {
          topic: 'current topic' // This would be passed from parent
        }
      });

      if (error) throw error;
      
      const generatedAudience = data.audience || '';
      onAudienceChange(generatedAudience);
      
      if (generatedAudience) {
        toast.success('Target audience generated successfully');
      }
    } catch (error) {
      console.error('Error generating audience:', error);
      toast.error('Failed to generate audience. Please try again.');
    } finally {
      setIsLocalGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Target Audience
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateAudience}
          disabled={isLocalGenerating || !hasTopic}
          className="flex items-center gap-2"
        >
          {isLocalGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          AI Generate
        </Button>
      </div>
      <Textarea
        placeholder="Describe your target audience (e.g., small business owners, marketing professionals, etc.)..."
        value={audience}
        onChange={(e) => onAudienceChange(e.target.value)}
        className="min-h-[80px]"
      />
      {audience && (
        <div className="text-xs text-gray-500">
          {audience.length} characters
        </div>
      )}
    </div>
  );
};
