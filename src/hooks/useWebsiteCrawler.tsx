
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CrawlResponse {
  success: boolean;
  websiteMapId?: string;
  crawlJobId?: string;
  totalPages?: number;
  status?: string;
  error?: string;
}

export const useWebsiteCrawler = () => {
  const [loading, setLoading] = useState(false);
  const [crawlData, setCrawlData] = useState<CrawlResponse | null>(null);

  const startCrawl = async (websiteUrl: string, isLeadMagnet = false) => {
    setLoading(true);
    setCrawlData(null);
    
    try {
      console.log('Starting crawl for:', websiteUrl);
      
      const { data, error } = await supabase.functions.invoke('crawl-website', {
        body: {
          websiteUrl,
          isLeadMagnet,
        },
      });

      if (error) {
        console.error('Crawl error:', error);
        throw error;
      }

      console.log('Crawl response:', data);
      setCrawlData(data);
      
      if (data.success) {
        toast.success(`Crawl started! Found ${data.totalPages} pages`);
      } else {
        toast.error(data.error || 'Failed to start crawl');
      }

      return data;
    } catch (error) {
      console.error('Error starting crawl:', error);
      toast.error('Failed to start website crawl');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    startCrawl,
    loading,
    crawlData,
  };
};
