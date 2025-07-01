
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CrawlRequest {
  websiteUrl: string;
  userId?: string;
  isLeadMagnet?: boolean;
}

interface CrawlResponse {
  success: boolean;
  websiteMapId?: string;
  crawlJobId?: string;
  totalPages?: number;
  status?: string;
  error?: string;
}

export const useWebsiteCrawler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startCrawl = async (request: CrawlRequest): Promise<CrawlResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('crawl-website', {
        body: request
      });

      if (error) {
        console.error('Crawl error:', error);
        toast({
          title: "Crawl Failed",
          description: error.message || "Failed to start website crawl",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success) {
        toast({
          title: "Crawl Started",
          description: `Started crawling ${request.websiteUrl} - ${data.totalPages} pages found`,
        });
        return data;
      } else {
        toast({
          title: "Crawl Failed",
          description: data?.error || "Failed to start crawl",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startCrawl,
    isLoading
  };
};
