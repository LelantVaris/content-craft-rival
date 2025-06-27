
-- Add company profile override fields and language preference to cms_connections
ALTER TABLE public.cms_connections 
ADD COLUMN company_name_override TEXT,
ADD COLUMN website_url_override TEXT,
ADD COLUMN target_audience_override TEXT,
ADD COLUMN industry_override TEXT,
ADD COLUMN content_goals_override TEXT[],
ADD COLUMN preferred_tone_override TEXT,
ADD COLUMN language_preference TEXT DEFAULT 'english';

-- Add language preference to user profiles
ALTER TABLE public.profiles 
ADD COLUMN language_preference TEXT DEFAULT 'english';
