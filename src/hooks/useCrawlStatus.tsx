
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CrawlStatusResponse {
  success: boolean;
  status?: string;
  completed?: number;
  total?: number;
  data?: any[];
  error?: string;
}

export const useCrawlStatus = (crawlJobId: string | null, websiteMapId: string | null) => {
  const [status, setStatus] = useState<CrawlStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const checkStatus = async () => {
    if (!crawlJobId || !websiteMapId) return;

    setLoading(true);
    try {
      console.log('Checking crawl status for job:', crawlJobId);
      
      const { data, error } = await supabase.functions.invoke('check-crawl-status', {
        body: {
          crawlJobId,
          websiteMapId,
        },
      });

      if (error) {
        console.error('Status check error:', error);
        throw error;
      }

      console.log('Status response:', data);
      setStatus(data);

      if (data.status === 'completed') {
        setPolling(false);
        toast.success('Website crawl completed!');
      } else if (data.status === 'failed') {
        setPolling(false);
        toast.error('Website crawl failed');
      }

      return data;
    } catch (error) {
      console.error('Error checking crawl status:', error);
      setPolling(false);
      toast.error('Failed to check crawl status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auto-polling when crawl is in progress
  useEffect(() => {
    if (!polling || !crawlJobId || !websiteMapId) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [polling, crawlJobId, websiteMapId]);

  const startPolling = () => {
    setPolling(true);
    checkStatus();
  };

  const stopPolling = () => {
    setPolling(false);
  };

  return {
    status,
    loading,
    polling,
    checkStatus,
    startPolling,
    stopPolling,
  };
};
