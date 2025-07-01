
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type WebsiteMap = Tables<'website_maps'>;
type WebsitePage = Tables<'website_pages'>;

export const useWebsiteMap = (websiteMapId?: string) => {
  const [websiteMap, setWebsiteMap] = useState<WebsiteMap | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsiteMap = async (mapId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch website map
      const { data: mapData, error: mapError } = await supabase
        .from('website_maps')
        .select('*')
        .eq('id', mapId)
        .single();

      if (mapError) {
        throw mapError;
      }

      setWebsiteMap(mapData);

      // Fetch pages for this map
      const { data: pagesData, error: pagesError } = await supabase
        .from('website_pages')
        .select('*')
        .eq('website_map_id', mapId)
        .order('created_at', { ascending: true });

      if (pagesError) {
        throw pagesError;
      }

      setPages(pagesData || []);
    } catch (err) {
      console.error('Error fetching website map:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch website map');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMaps = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('website_maps')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching user maps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch website maps');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (websiteMapId) {
      fetchWebsiteMap(websiteMapId);
    }
  }, [websiteMapId]);

  return {
    websiteMap,
    pages,
    loading,
    error,
    fetchWebsiteMap,
    fetchUserMaps
  };
};
