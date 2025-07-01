
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface StatusResponse {
  success: boolean;
  status?: string;
  completed?: number;
  total?: number;
  data?: any[];
  error?: string;
}

export const useCrawlStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkStatus = async (crawlJobId: string, websiteMapId: string): Promise<StatusResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-crawl-status', {
        body: { crawlJobId, websiteMapId }
      });

      if (error) {
        console.error('Status check error:', error);
        toast({
          title: "Status Check Failed",
          description: error.message || "Failed to check crawl status",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while checking status",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkStatus,
    isLoading
  };
};
