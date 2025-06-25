
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Settings } from 'lucide-react';
import { AudienceGenerator } from './AudienceGenerator';
import { KeywordGenerator } from './KeywordGenerator';
import { SEOSettings } from './SEOSettings';
import { SEOPreferences } from '@/hooks/useSEOConfiguration';

interface SEOProModeProps {
  seoProMode: boolean;
  onSeoProModeChange: (enabled: boolean) => void;
  audience: string;
  keywords: string[];
  seoPreferences: SEOPreferences;
  onAudienceChange: (audience: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
  onSEOPreferenceUpdate: (updates: Partial<SEOPreferences>) => void;
  onGenerateAudience: () => Promise<void>;
  onGenerateKeywords: () => Promise<void>;
  isGeneratingAudience: boolean;
  isGeneratingKeywords: boolean;
  hasTopic: boolean;
}

export const SEOProMode: React.FC<SEOProModeProps> = ({
  seoProMode,
  onSeoProModeChange,
  audience,
  keywords,
  seoPreferences,
  onAudienceChange,
  onKeywordsChange,
  onSEOPreferenceUpdate,
  onGenerateAudience,
  onGenerateKeywords,
  isGeneratingAudience,
  isGeneratingKeywords,
  hasTopic
}) => {
  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <CardTitle>SEO Pro Mode</CardTitle>
          </div>
          <Switch
            checked={seoProMode}
            onCheckedChange={onSeoProModeChange}
          />
        </div>
      </CardHeader>
      
      <Collapsible open={seoProMode}>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <AudienceGenerator
              audience={audience}
              onAudienceChange={onAudienceChange}
              onGenerateAudience={onGenerateAudience}
              isGenerating={isGeneratingAudience}
              hasTopic={hasTopic}
            />

            <KeywordGenerator
              keywords={keywords}
              onKeywordsChange={onKeywordsChange}
              onGenerateKeywords={onGenerateKeywords}
              isGenerating={isGeneratingKeywords}
              hasTopic={hasTopic}
            />

            <SEOSettings
              seoPreferences={seoPreferences}
              onSEOPreferenceUpdate={onSEOPreferenceUpdate}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
