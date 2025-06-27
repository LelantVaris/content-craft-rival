
import { useState, useEffect } from 'react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useProfile } from '@/hooks/useProfile';
import { Tables } from '@/integrations/supabase/types';

type CMSConnection = Tables<'cms_connections'>;
type CompanyProfile = Tables<'company_profiles'>;
type Profile = Tables<'profiles'>;

interface ResolvedSettings {
  companyName: string;
  websiteUrl: string;
  targetAudience: string;
  industry: string;
  contentGoals: string[];
  preferredTone: string;
  languagePreference: string;
}

export const useConnectionSettings = (connection?: CMSConnection | null) => {
  const { companyProfile } = useCompanyProfile();
  const { profile } = useProfile();
  const [resolvedSettings, setResolvedSettings] = useState<ResolvedSettings | null>(null);

  useEffect(() => {
    if (!companyProfile || !profile) {
      setResolvedSettings(null);
      return;
    }

    // Resolve settings with connection overrides taking priority
    const resolved: ResolvedSettings = {
      companyName: connection?.company_name_override || companyProfile.company_name || '',
      websiteUrl: connection?.website_url_override || companyProfile.website_url || '',
      targetAudience: connection?.target_audience_override || companyProfile.target_audience || '',
      industry: connection?.industry_override || companyProfile.industry || '',
      contentGoals: connection?.content_goals_override || companyProfile.content_goals || [],
      preferredTone: connection?.preferred_tone_override || companyProfile.preferred_tone || 'professional',
      languagePreference: connection?.language_preference || profile.language_preference || 'english',
    };

    setResolvedSettings(resolved);
  }, [connection, companyProfile, profile]);

  return {
    resolvedSettings,
    hasOverrides: !!(connection && (
      connection.company_name_override ||
      connection.website_url_override ||
      connection.target_audience_override ||
      connection.industry_override ||
      connection.content_goals_override?.length ||
      connection.preferred_tone_override ||
      (connection.language_preference && connection.language_preference !== (profile?.language_preference || 'english'))
    )),
  };
};
