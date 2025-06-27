
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type CompanyProfile = Tables<'company_profiles'>;

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user) {
        setCompanyProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching company profile:', error);
        } else {
          setCompanyProfile(data);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [user]);

  return { companyProfile, loading };
};
