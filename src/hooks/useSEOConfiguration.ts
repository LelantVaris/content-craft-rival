
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SEOPreferences {
  defaultTone: string;
  preferredArticleLength: number;
  defaultKeywords: string[];
  defaultAudience: string;
}

export function useSEOConfiguration() {
  const [seoPreferences, setSeoPreferences] = useState<SEOPreferences>({
    defaultTone: 'professional',
    preferredArticleLength: 1500,
    defaultKeywords: [],
    defaultAudience: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user's SEO preferences on mount
  useEffect(() => {
    loadSEOPreferences();
  }, []);

  const loadSEOPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_seo_preferences')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading SEO preferences:', error);
        return;
      }

      if (data) {
        setSeoPreferences({
          defaultTone: data.default_tone || 'professional',
          preferredArticleLength: data.preferred_article_length || 1500,
          defaultKeywords: data.default_keywords || [],
          defaultAudience: data.default_audience || ''
        });
      }
    } catch (error) {
      console.error('Error loading SEO preferences:', error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  const saveSEOPreferences = useCallback(async (preferences: Partial<SEOPreferences>) => {
    try {
      setIsLoading(true);
      
      const updatedPreferences = { ...seoPreferences, ...preferences };
      
      const { error } = await supabase.rpc('upsert_seo_preferences', {
        p_tone: updatedPreferences.defaultTone,
        p_article_length: updatedPreferences.preferredArticleLength,
        p_keywords: updatedPreferences.defaultKeywords,
        p_audience: updatedPreferences.defaultAudience
      });

      if (error) {
        console.error('Error saving SEO preferences:', error);
        toast.error('Failed to save SEO preferences');
        return;
      }

      setSeoPreferences(updatedPreferences);
      toast.success('SEO preferences saved');
    } catch (error) {
      console.error('Error saving SEO preferences:', error);
      toast.error('Failed to save SEO preferences');
    } finally {
      setIsLoading(false);
    }
  }, [seoPreferences]);

  const updateSEOPreferences = useCallback((updates: Partial<SEOPreferences>) => {
    setSeoPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  // AI Generation functions
  const generateAudience = useCallback(async (topic: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-audience', {
        body: { topic }
      });

      if (error) {
        throw error;
      }

      const { audience } = data;
      updateSEOPreferences({ defaultAudience: audience });
      toast.success('Audience generated successfully');
      return audience;
    } catch (error) {
      console.error('Error generating audience:', error);
      toast.error('Failed to generate audience');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateSEOPreferences]);

  const generateKeywords = useCallback(async (topic: string, audience?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: { topic, audience }
      });

      if (error) {
        throw error;
      }

      const { keywords } = data;
      updateSEOPreferences({ defaultKeywords: keywords });
      toast.success(`Generated ${keywords.length} keywords`);
      return keywords;
    } catch (error) {
      console.error('Error generating keywords:', error);
      toast.error('Failed to generate keywords');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateSEOPreferences]);

  return {
    seoPreferences,
    updateSEOPreferences,
    saveSEOPreferences,
    loadSEOPreferences,
    generateAudience,
    generateKeywords,
    isLoading,
    isLoaded
  };
}
