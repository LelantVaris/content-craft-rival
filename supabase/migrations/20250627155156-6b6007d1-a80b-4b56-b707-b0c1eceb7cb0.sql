
-- Extend articles table for calendar features
ALTER TABLE articles ADD COLUMN scheduled_date DATE;
ALTER TABLE articles ADD COLUMN calendar_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN generation_batch_id UUID;

-- Create content generation batches table
CREATE TABLE content_generation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_articles INTEGER NOT NULL,
  completed_articles INTEGER DEFAULT 0,
  failed_articles INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  generation_options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create publishing jobs queue table
CREATE TABLE publishing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  cms_connection_id UUID REFERENCES cms_connections(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create CMS collections cache table
CREATE TABLE cms_collections_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES cms_connections(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL,
  collection_name TEXT NOT NULL,
  collection_data JSONB NOT NULL,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(connection_id, collection_id)
);

-- Enable Row Level Security
ALTER TABLE content_generation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_collections_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_generation_batches
CREATE POLICY "Users can view their own generation batches" 
  ON content_generation_batches 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own generation batches" 
  ON content_generation_batches 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own generation batches" 
  ON content_generation_batches 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own generation batches" 
  ON content_generation_batches 
  FOR DELETE 
  USING (user_id = auth.uid());

-- RLS Policies for publishing_jobs (based on article ownership)
CREATE POLICY "Users can view publishing jobs for their articles" 
  ON publishing_jobs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = publishing_jobs.article_id 
    AND articles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create publishing jobs for their articles" 
  ON publishing_jobs 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = publishing_jobs.article_id 
    AND articles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update publishing jobs for their articles" 
  ON publishing_jobs 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = publishing_jobs.article_id 
    AND articles.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete publishing jobs for their articles" 
  ON publishing_jobs 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = publishing_jobs.article_id 
    AND articles.user_id = auth.uid()
  ));

-- RLS Policies for cms_collections_cache (based on connection ownership)
CREATE POLICY "Users can view their CMS collections cache" 
  ON cms_collections_cache 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM cms_connections 
    WHERE cms_connections.id = cms_collections_cache.connection_id 
    AND cms_connections.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their CMS collections cache" 
  ON cms_collections_cache 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM cms_connections 
    WHERE cms_connections.id = cms_collections_cache.connection_id 
    AND cms_connections.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_articles_scheduled_date ON articles(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_articles_calendar_generated ON articles(calendar_generated) WHERE calendar_generated = TRUE;
CREATE INDEX idx_articles_generation_batch_id ON articles(generation_batch_id) WHERE generation_batch_id IS NOT NULL;
CREATE INDEX idx_content_generation_batches_user_id ON content_generation_batches(user_id);
CREATE INDEX idx_content_generation_batches_status ON content_generation_batches(status);
CREATE INDEX idx_publishing_jobs_article_id ON publishing_jobs(article_id);
CREATE INDEX idx_publishing_jobs_scheduled_time ON publishing_jobs(scheduled_time);
CREATE INDEX idx_publishing_jobs_status ON publishing_jobs(status);
CREATE INDEX idx_cms_collections_cache_connection_id ON cms_collections_cache(connection_id);

-- Create trigger to automatically update articles.updated_at when scheduled_date changes
CREATE OR REPLACE FUNCTION update_article_scheduled_date()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.scheduled_date IS DISTINCT FROM NEW.scheduled_date THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_article_scheduled_date
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_article_scheduled_date();
