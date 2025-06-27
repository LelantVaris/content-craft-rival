
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CompletionStepProps {
  data: {
    fullName: string;
    companyName: string;
    websiteUrl: string;
    industry: string;
    targetAudience: string;
    contentGoals: string[];
    preferredTone: string;
    webflowConnected: boolean;
  };
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ data }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    saveOnboardingData();
  }, []);

  const saveOnboardingData = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Create company profile
      const { data: companyProfile, error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          user_id: user.id,
          company_name: data.companyName,
          website_url: data.websiteUrl,
          industry: data.industry,
          target_audience: data.targetAudience,
          content_goals: data.contentGoals,
          preferred_tone: data.preferredTone,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Update profile with onboarding completion and company profile reference
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          onboarding_completed: true,
          company_profile_id: companyProfile.id,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      console.log('Onboarding data saved successfully');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Failed to save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/');
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          You're all set!
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Welcome to ArticleForge, {data.fullName.split(' ')[0]}! 
          <br />Let's create amazing content together.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">What's next?</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 ml-7">
            <li>• Start creating AI-powered articles in Article Studio</li>
            <li>• Use your company info for personalized content</li>
            <li>• Explore our content calendar and scheduling tools</li>
            {data.webflowConnected && (
              <li>• Publish directly to your Webflow site</li>
            )}
          </ul>
        </div>

        <Button 
          onClick={handleGetStarted}
          disabled={saving}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {saving ? 'Setting up...' : 'Get Started'}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Check out our documentation or contact support
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
