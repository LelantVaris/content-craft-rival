
-- Website maps and crawl data
CREATE TABLE public.website_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  website_url TEXT NOT NULL,
  sitemap_url TEXT,
  crawl_status TEXT DEFAULT 'pending' CHECK (crawl_status IN ('pending', 'crawling', 'completed', 'failed')),
  total_pages INTEGER DEFAULT 0,
  crawled_pages INTEGER DEFAULT 0,
  last_crawl_date TIMESTAMP WITH TIME ZONE,
  crawl_job_id TEXT,
  crawl_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual page data 
CREATE TABLE public.website_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_map_id UUID REFERENCES public.website_maps(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  content_summary TEXT,
  word_count INTEGER DEFAULT 0,
  internal_links TEXT[] DEFAULT '{}',
  external_links TEXT[] DEFAULT '{}',
  crawl_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(website_map_id, url)
);

-- Internal link connections for graph visualization
CREATE TABLE public.page_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_map_id UUID REFERENCES public.website_maps(id) ON DELETE CASCADE,
  source_page_id UUID REFERENCES public.website_pages(id) ON DELETE CASCADE,
  target_page_id UUID REFERENCES public.website_pages(id) ON DELETE CASCADE,
  link_text TEXT,
  link_type TEXT DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_page_id, target_page_id)
);

-- Lead magnet tracking (for non-logged users)
CREATE TABLE public.lead_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  website_url TEXT NOT NULL,
  map_data JSONB,
  conversion_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- Website maps policies
CREATE POLICY "Users can view their own website maps" ON public.website_maps
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own website maps" ON public.website_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own website maps" ON public.website_maps
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own website maps" ON public.website_maps
  FOR DELETE USING (auth.uid() = user_id);

-- Website pages policies
CREATE POLICY "Users can view pages from their website maps" ON public.website_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.website_maps 
      WHERE id = website_map_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pages to their website maps" ON public.website_pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.website_maps 
      WHERE id = website_map_id AND user_id = auth.uid()
    )
  );

-- Page connections policies  
CREATE POLICY "Users can view connections from their website maps" ON public.page_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.website_maps 
      WHERE id = website_map_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert connections to their website maps" ON public.page_connections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.website_maps 
      WHERE id = website_map_id AND user_id = auth.uid()
    )
  );

-- Lead captures (public access for lead magnet)
CREATE POLICY "Anyone can create lead captures" ON public.lead_captures
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_website_maps_user_id ON public.website_maps(user_id);
CREATE INDEX idx_website_pages_map_id ON public.website_pages(website_map_id);
CREATE INDEX idx_page_connections_map_id ON public.page_connections(website_map_id);
CREATE INDEX idx_page_connections_source ON public.page_connections(source_page_id);
CREATE INDEX idx_page_connections_target ON public.page_connections(target_page_id);
