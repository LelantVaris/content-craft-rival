
-- Create company_profiles table to store company information
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,
  website_url TEXT,
  industry TEXT,
  target_audience TEXT,
  content_goals TEXT[],
  preferred_tone TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN company_profile_id UUID REFERENCES public.company_profiles(id);

-- Enable RLS for company_profiles
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_profiles
CREATE POLICY "Users can view their own company profile" 
  ON public.company_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company profile" 
  ON public.company_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile" 
  ON public.company_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to update company_profiles updated_at
CREATE OR REPLACE FUNCTION update_company_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profiles_updated_at();
