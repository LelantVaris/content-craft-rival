
-- Enhanced profiles table with credit system
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 100, -- Monthly credits for stand-alone tools
  is_lifetime BOOLEAN DEFAULT FALSE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'lifetime')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Credit transactions for tracking usage
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL, -- Negative for usage, positive for additions
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('usage', 'purchase', 'monthly_reset', 'bonus')),
  description TEXT,
  tool_used TEXT, -- 'llm-txt', 'alt-text', 'meta-info'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog writer workflows - tracks the 6-step process
CREATE TABLE public.blog_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic TEXT NOT NULL,
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 6),
  keyword_data JSONB, -- Step 1: SERP data, keyword clusters
  outline_data JSONB, -- Step 2: H2/H3 structure, metadata
  draft_content TEXT, -- Step 3: ~1200 words content
  seo_polish JSONB, -- Step 4: Entities, FAQ, internal links
  meta_info JSONB, -- Step 5: Title, description, schema
  publish_config JSONB, -- Step 6: CMS webhook config
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced articles table for final content
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workflow_id UUID REFERENCES public.blog_workflows,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  keywords TEXT[],
  content_type TEXT DEFAULT 'blog-post',
  tone TEXT DEFAULT 'professional',
  target_audience TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  seo_score INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS integrations (Webflow, WordPress, etc.)
CREATE TABLE public.cms_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cms_type TEXT NOT NULL CHECK (cms_type IN ('webflow', 'wordpress', 'shopify', 'framer')),
  connection_name TEXT NOT NULL,
  credentials JSONB NOT NULL, -- Encrypted tokens/API keys
  site_id TEXT, -- For multi-site CMSes like Webflow
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publishing history
CREATE TABLE public.publish_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles NOT NULL,
  cms_connection_id UUID REFERENCES public.cms_connections NOT NULL,
  external_id TEXT, -- ID in the external CMS
  external_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for blog_workflows
CREATE POLICY "Users can manage their own workflows" ON public.blog_workflows
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for articles
CREATE POLICY "Users can manage their own articles" ON public.articles
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for cms_connections
CREATE POLICY "Users can manage their own CMS connections" ON public.cms_connections
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for publish_logs
CREATE POLICY "Users can view their own publish logs" ON public.publish_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.articles 
      WHERE articles.id = publish_logs.article_id 
      AND articles.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration with credit initialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, credits, plan_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    100, -- Start with 100 free credits
    'free'
  );
  
  -- Log the initial credit grant
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 100, 'bonus', 'Welcome bonus - 100 free credits');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update article statistics
CREATE OR REPLACE FUNCTION public.update_article_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate word count and reading time
  IF NEW.content IS NOT NULL THEN
    NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    NEW.reading_time = GREATEST(1, CEIL(NEW.word_count / 200.0));
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for article statistics
CREATE TRIGGER update_article_stats_trigger
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_article_stats();

-- Create function to deduct credits for stand-alone tools
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_tool_used TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Check if user has enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.profiles 
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, tool_used)
  VALUES (p_user_id, -p_amount, 'usage', COALESCE(p_description, 'Credit usage'), p_tool_used);
  
  RETURN TRUE;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_blog_workflows_user_id ON public.blog_workflows(user_id);
CREATE INDEX idx_blog_workflows_status ON public.blog_workflows(status);
CREATE INDEX idx_articles_user_id ON public.articles(user_id);
CREATE INDEX idx_articles_workflow_id ON public.articles(workflow_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX idx_cms_connections_user_id ON public.cms_connections(user_id);
CREATE INDEX idx_publish_logs_article_id ON public.publish_logs(article_id);
