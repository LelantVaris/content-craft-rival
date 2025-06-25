
-- Create user_seo_preferences table for persistent SEO settings
CREATE TABLE public.user_seo_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  default_tone TEXT DEFAULT 'professional' CHECK (default_tone IN ('professional', 'casual', 'technical', 'conversational', 'authoritative')),
  preferred_article_length INTEGER DEFAULT 1500 CHECK (preferred_article_length IN (1000, 1500, 2500, 4000)),
  default_keywords TEXT[] DEFAULT '{}',
  default_audience TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_seo_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own SEO preferences" ON public.user_seo_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SEO preferences" ON public.user_seo_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO preferences" ON public.user_seo_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEO preferences" ON public.user_seo_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to upsert SEO preferences
CREATE OR REPLACE FUNCTION public.upsert_seo_preferences(
  p_tone TEXT DEFAULT 'professional',
  p_article_length INTEGER DEFAULT 1500,
  p_keywords TEXT[] DEFAULT '{}',
  p_audience TEXT DEFAULT ''
)
RETURNS public.user_seo_preferences
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result public.user_seo_preferences;
BEGIN
  INSERT INTO public.user_seo_preferences (
    user_id, 
    default_tone, 
    preferred_article_length, 
    default_keywords, 
    default_audience
  )
  VALUES (
    auth.uid(), 
    p_tone, 
    p_article_length, 
    p_keywords, 
    p_audience
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    default_tone = EXCLUDED.default_tone,
    preferred_article_length = EXCLUDED.preferred_article_length,
    default_keywords = EXCLUDED.default_keywords,
    default_audience = EXCLUDED.default_audience,
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_seo_preferences_user_id ON public.user_seo_preferences(user_id);
