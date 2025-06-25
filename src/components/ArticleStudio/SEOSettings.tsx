
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEOPreferences } from '@/hooks/useSEOConfiguration';

interface SEOSettingsProps {
  seoPreferences: SEOPreferences;
  onSEOPreferenceUpdate: (updates: Partial<SEOPreferences>) => void;
}

export const SEOSettings: React.FC<SEOSettingsProps> = ({
  seoPreferences,
  onSEOPreferenceUpdate
}) => {
  return (
    <div className="space-y-6">
      {/* Tone Selection */}
      <div className="space-y-2">
        <Label>Tone</Label>
        <Select
          value={seoPreferences.defaultTone}
          onValueChange={(value) => onSEOPreferenceUpdate({ defaultTone: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="authoritative">Authoritative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Article Length */}
      <div className="space-y-2">
        <Label>Target Article Length</Label>
        <Select
          value={seoPreferences.preferredArticleLength.toString()}
          onValueChange={(value) => onSEOPreferenceUpdate({ preferredArticleLength: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000">1,000 words</SelectItem>
            <SelectItem value="1500">1,500 words</SelectItem>
            <SelectItem value="2500">2,500 words</SelectItem>
            <SelectItem value="4000">4,000+ words</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
