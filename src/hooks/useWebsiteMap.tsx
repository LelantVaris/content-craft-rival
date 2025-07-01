
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type WebsiteMap = Tables<'website_maps'>;
type WebsitePage = Tables<'website_pages'>;
type PageConnection = Tables<'page_connections'>;

export const useWebsiteMap = (websiteMapId: string | null) => {
  const [websiteMap, setWebsiteMap] = useState<WebsiteMap | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [connections, setConnections] = useState<PageConnection[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWebsiteMap = async () => {
    if (!websiteMapId) return;

    setLoading(true);
    try {
      // Fetch website map
      const { data: mapData, error: mapError } = await supabase
        .from('website_maps')
        .select('*')
        .eq('id', websiteMapId)
        .single();

      if (mapError) throw mapError;
      setWebsiteMap(mapData);

      // Fetch pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('website_pages')
        .select('*')
        .eq('website_map_id', websiteMapId);

      if (pagesError) throw pagesError;
      setPages(pagesData || []);

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('page_connections')
        .select('*')
        .eq('website_map_id', websiteMapId);

      if (connectionsError) throw connectionsError;
      setConnections(connectionsData || []);

    } catch (error) {
      console.error('Error fetching website map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteMap();
  }, [websiteMapId]);

  return {
    websiteMap,
    pages,
    connections,
    loading,
    refetch: fetchWebsiteMap,
  };
};
