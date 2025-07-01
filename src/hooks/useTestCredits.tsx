
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTestCredits = () => {
  const [loading, setLoading] = useState(false);

  const addTestCredits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-test-credits');
      
      if (error) {
        throw error;
      }

      toast.success('1000 test credits added successfully!');
      
      // Force refresh the page to update credit display
      window.location.reload();
      
      return data;
    } catch (error) {
      console.error('Error adding test credits:', error);
      toast.error('Failed to add test credits');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addTestCredits,
    loading
  };
};
