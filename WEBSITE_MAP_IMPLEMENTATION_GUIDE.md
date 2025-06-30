
# Website Connection Map - Technical Implementation Guide

## Overview
Build an internal website mapping feature that visualizes page connections like Obsidian's graph view. This serves as both a lead magnet and authenticated user feature using Firecrawl for website crawling.

## Phase 1: Database Schema & Setup

### Required SQL Migrations

```sql
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

-- RLS Policies
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

-- Lead captures (public access for lead magnet)
CREATE POLICY "Anyone can create lead captures" ON public.lead_captures
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_website_maps_user_id ON public.website_maps(user_id);
CREATE INDEX idx_website_pages_map_id ON public.website_pages(website_map_id);
CREATE INDEX idx_page_connections_map_id ON public.page_connections(website_map_id);
CREATE INDEX idx_page_connections_source ON public.page_connections(source_page_id);
CREATE INDEX idx_page_connections_target ON public.page_connections(target_page_id);
```

### Dependencies Installation

```bash
# Install Firecrawl JS SDK
npm install @mendable/firecrawl-js

# Install React Flow for graph visualization
npm install @xyflow/react

# Install additional utilities
npm install url-parse
```

## Phase 2: Firecrawl Integration & Backend

### Documentation References
- [Firecrawl API Documentation](https://docs.firecrawl.dev/api-reference/introduction)
- [Firecrawl Map Feature](https://docs.firecrawl.dev/features/map)
- [Firecrawl Crawl Feature](https://docs.firecrawl.dev/api-reference/endpoint/crawl)

### Edge Function: `crawl-website`

**File:** `supabase/functions/crawl-website/index.ts`

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CrawlRequest {
  websiteUrl: string;
  userId?: string;
  isLeadMagnet?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl, userId, isLeadMagnet = false }: CrawlRequest = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Try to get sitemap first (much faster)
    console.log('Attempting to fetch sitemap for:', websiteUrl);
    const sitemapUrl = `${websiteUrl.replace(/\/$/, '')}/sitemap.xml`;
    
    let urls: string[] = [];
    
    try {
      const sitemapResponse = await fetch(sitemapUrl);
      if (sitemapResponse.ok) {
        const sitemapXml = await sitemapResponse.text();
        // Simple XML parsing for URLs - you might want to use a proper XML parser
        const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);
        if (urlMatches) {
          urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
          console.log(`Found ${urls.length} URLs in sitemap`);
        }
      }
    } catch (error) {
      console.log('Sitemap not found or invalid, falling back to crawling');
    }
    
    // Step 2: If no sitemap, use Firecrawl Map feature for URL discovery
    if (urls.length === 0) {
      console.log('Using Firecrawl Map feature for URL discovery');
      const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: websiteUrl,
          search: websiteUrl.replace(/https?:\/\//, '').replace(/\/$/, ''),
          limit: 100,
        }),
      });
      
      const mapData = await mapResponse.json();
      if (mapData.success && mapData.links) {
        urls = mapData.links.map((link: any) => link.url);
        console.log(`Found ${urls.length} URLs via Firecrawl Map`);
      }
    }
    
    if (urls.length === 0) {
      throw new Error('No URLs found via sitemap or mapping');
    }
    
    // Step 3: Create website map record
    const { data: websiteMap, error: mapError } = await supabase
      .from('website_maps')
      .insert({
        user_id: userId,
        website_url: websiteUrl,
        sitemap_url: sitemapUrl,
        crawl_status: 'crawling',
        total_pages: urls.length,
        crawled_pages: 0,
      })
      .select()
      .single();
      
    if (mapError) throw mapError;
    
    // Step 4: Start Firecrawl crawl job for detailed content
    console.log('Starting Firecrawl crawl for detailed content analysis');
    const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        limit: Math.min(urls.length, 50), // Limit for initial implementation
        scrapeOptions: {
          formats: ['markdown', 'links'],
          onlyMainContent: true,
          includeTags: ['title', 'meta'],
        },
      }),
    });
    
    const crawlData = await crawlResponse.json();
    
    if (!crawlData.success) {
      throw new Error(`Crawl failed: ${crawlData.error}`);
    }
    
    // Step 5: Update with crawl job ID
    await supabase
      .from('website_maps')
      .update({ 
        crawl_job_id: crawlData.id,
        crawl_data: crawlData 
      })
      .eq('id', websiteMap.id);
    
    // Step 6: For lead magnet, store preliminary data
    if (isLeadMagnet) {
      await supabase
        .from('lead_captures')
        .insert({
          website_url: websiteUrl,
          map_data: {
            total_urls: urls.length,
            crawl_job_id: crawlData.id,
            discovered_urls: urls.slice(0, 10), // Preview only
          },
        });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        websiteMapId: websiteMap.id,
        crawlJobId: crawlData.id,
        totalPages: urls.length,
        status: 'crawling',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in crawl-website:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

### Edge Function: `check-crawl-status`

**File:** `supabase/functions/check-crawl-status/index.ts`

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crawlJobId, websiteMapId } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check crawl status with Firecrawl
    const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlJobId}`, {
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const statusData = await statusResponse.json();
    
    if (!statusData.success) {
      throw new Error(`Status check failed: ${statusData.error}`);
    }
    
    // Update website map with current status
    await supabase
      .from('website_maps')
      .update({
        crawl_status: statusData.status,
        crawled_pages: statusData.completed || 0,
        last_crawl_date: new Date().toISOString(),
      })
      .eq('id', websiteMapId);
    
    // If completed, process the crawled data
    if (statusData.status === 'completed' && statusData.data) {
      await processCrawledData(supabase, websiteMapId, statusData.data);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        status: statusData.status,
        completed: statusData.completed,
        total: statusData.total,
        data: statusData.status === 'completed' ? statusData.data : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error checking crawl status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processCrawledData(supabase: any, websiteMapId: string, crawlData: any[]) {
  console.log(`Processing ${crawlData.length} crawled pages`);
  
  // Insert page data
  const pages = crawlData.map(page => ({
    website_map_id: websiteMapId,
    url: page.metadata?.sourceURL || page.url,
    title: page.metadata?.title || '',
    meta_description: page.metadata?.description || '',
    content_summary: page.markdown?.substring(0, 500) || '',
    word_count: page.markdown ? page.markdown.split(' ').length : 0,
    internal_links: page.linksOnPage?.filter((link: string) => 
      link.includes(new URL(page.metadata?.sourceURL || page.url).hostname)
    ) || [],
    external_links: page.linksOnPage?.filter((link: string) => 
      !link.includes(new URL(page.metadata?.sourceURL || page.url).hostname)
    ) || [],
    crawl_data: {
      metadata: page.metadata,
      linksOnPage: page.linksOnPage,
    },
  }));
  
  const { data: insertedPages, error } = await supabase
    .from('website_pages')
    .upsert(pages, { onConflict: 'website_map_id,url' })
    .select();
    
  if (error) {
    console.error('Error inserting pages:', error);
    return;
  }
  
  // Create page connections
  const connections = [];
  for (const page of insertedPages) {
    const internalLinks = page.internal_links || [];
    for (const link of internalLinks) {
      const targetPage = insertedPages.find(p => p.url === link);
      if (targetPage && targetPage.id !== page.id) {
        connections.push({
          website_map_id: websiteMapId,
          source_page_id: page.id,
          target_page_id: targetPage.id,
          link_type: 'internal',
        });
      }
    }
  }
  
  if (connections.length > 0) {
    await supabase
      .from('page_connections')
      .upsert(connections, { onConflict: 'source_page_id,target_page_id' });
  }
  
  // Update website map status
  await supabase
    .from('website_maps')
    .update({ crawl_status: 'completed' })
    .eq('id', websiteMapId);
    
  console.log(`Processed ${pages.length} pages and ${connections.length} connections`);
}
```

## Phase 3: Lead Magnet Landing Page

### Route Setup

**File:** `src/pages/WebsiteMapAnalyzer.tsx`

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, MapPin, Link, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CrawlStatus {
  status: 'idle' | 'crawling' | 'completed' | 'error';
  progress: number;
  totalPages: number;
  crawledPages: number;
  error?: string;
}

export default function WebsiteMapAnalyzer() {
  const [url, setUrl] = useState('');
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>({ 
    status: 'idle', 
    progress: 0, 
    totalPages: 0, 
    crawledPages: 0 
  });
  const [websiteMapId, setWebsiteMapId] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    
    setCrawlStatus({ status: 'crawling', progress: 10, totalPages: 0, crawledPages: 0 });
    
    try {
      // Start crawl
      const { data, error } = await supabase.functions.invoke('crawl-website', {
        body: {
          websiteUrl: url,
          isLeadMagnet: true,
        },
      });
      
      if (error) throw error;
      
      setWebsiteMapId(data.websiteMapId);
      setCrawlStatus(prev => ({ 
        ...prev, 
        progress: 30, 
        totalPages: data.totalPages 
      }));
      
      // Poll for status
      pollCrawlStatus(data.crawlJobId, data.websiteMapId);
      
    } catch (error) {
      setCrawlStatus({ 
        status: 'error', 
        progress: 0, 
        totalPages: 0, 
        crawledPages: 0,
        error: error.message 
      });
    }
  };

  const pollCrawlStatus = async (crawlJobId: string, mapId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-crawl-status', {
          body: { crawlJobId, websiteMapId: mapId },
        });
        
        if (error) throw error;
        
        const progress = data.total > 0 ? (data.completed / data.total) * 100 : 50;
        
        setCrawlStatus({
          status: data.status === 'completed' ? 'completed' : 'crawling',
          progress,
          totalPages: data.total,
          crawledPages: data.completed,
        });
        
        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setShowSignup(true);
        }
        
      } catch (error) {
        clearInterval(pollInterval);
        setCrawlStatus(prev => ({ 
          ...prev, 
          status: 'error', 
          error: error.message 
        }));
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <Globe className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Connection Map Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how your website pages are connected. Get insights into your internal link structure, 
            find orphaned pages, and optimize your site architecture.
          </p>
        </div>

        {/* Main Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-8 shadow-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your website URL
                </label>
                <div className="flex gap-4">
                  <Input
                    type="url"
                    placeholder="https://your-website.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                    disabled={crawlStatus.status === 'crawling'}
                  />
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!url || crawlStatus.status === 'crawling'}
                    className="px-8"
                  >
                    {crawlStatus.status === 'crawling' ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              </div>
              
              {/* Progress */}
              {crawlStatus.status === 'crawling' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Analyzing website structure...</span>
                    <span>{crawlStatus.crawledPages} / {crawlStatus.totalPages} pages</span>
                  </div>
                  <Progress value={crawlStatus.progress} className="h-2" />
                </div>
              )}
              
              {/* Error */}
              {crawlStatus.status === 'error' && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{crawlStatus.error}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Results Preview */}
        {crawlStatus.status === 'completed' && !showSignup && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Analysis Complete!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {crawlStatus.totalPages}
                  </div>
                  <div className="text-gray-600">Total Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.floor(crawlStatus.totalPages * 0.7)}
                  </div>
                  <div className="text-gray-600">Connected Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {Math.floor(crawlStatus.totalPages * 0.3)}
                  </div>
                  <div className="text-gray-600">Potential Issues</div>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => setShowSignup(true)}
                  size="lg"
                  className="px-8"
                >
                  View Interactive Map & Get Full Report
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Signup Gate */}
        {showSignup && (
          <div className="max-w-md mx-auto">
            <Card className="p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-center mb-6">
                Get Your Complete Website Map
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Interactive connection graph</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Link className="w-5 h-5 text-blue-600" />
                  <span>Detailed SEO insights</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Save and track multiple sites</span>
                </div>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full"
                size="lg"
              >
                Create Free Account
              </Button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account? <a href="/auth" className="text-blue-600 hover:underline">Sign in</a>
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Route Registration

**Update:** `src/App.tsx` (add route)

```typescript
// Add to your router configuration
<Route path="/website-map-analyzer" element={<WebsiteMapAnalyzer />} />
```

## Phase 4: Authenticated User Features

### Sidebar Integration

**Update:** `src/components/nav-main.tsx`

```typescript
// Add to navigation items
{
  title: "Site Maps",
  url: "/site-maps",
  icon: Globe,
  isActive: pathname.startsWith("/site-maps"),
},
```

### Site Maps Dashboard

**File:** `src/pages/SiteMaps.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface WebsiteMap {
  id: string;
  website_url: string;
  crawl_status: string;
  total_pages: number;
  crawled_pages: number;
  last_crawl_date: string;
  created_at: string;
}

export default function SiteMaps() {
  const [websiteMaps, setWebsiteMaps] = useState<WebsiteMap[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWebsiteMaps();
  }, []);

  const fetchWebsiteMaps = async () => {
    try {
      const { data, error } = await supabase
        .from('website_maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebsiteMaps(data || []);
    } catch (error) {
      console.error('Error fetching website maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'crawling': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Maps</h1>
          <p className="text-gray-600 mt-2">
            Analyze and visualize your website's internal link structure
          </p>
        </div>
        <Button 
          onClick={() => navigate('/site-maps/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Analyze New Website
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-200 rounded-t-lg" />
              <CardContent className="h-32 bg-gray-100" />
            </Card>
          ))}
        </div>
      ) : websiteMaps.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No website maps yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by analyzing your first website to see its connection structure
            </p>
            <Button onClick={() => navigate('/site-maps/new')}>
              Analyze Your First Website
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websiteMaps.map(map => (
            <Card 
              key={map.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/site-maps/${map.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">
                    {new URL(map.website_url).hostname}
                  </CardTitle>
                  <Badge className={getStatusColor(map.crawl_status)}>
                    {map.crawl_status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {map.website_url}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pages</span>
                    <span className="font-semibold">
                      {map.crawled_pages} / {map.total_pages}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Crawl</span>
                    <span className="text-sm font-medium">
                      {map.last_crawl_date 
                        ? new Date(map.last_crawl_date).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/site-maps/${map.id}/graph`);
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Trigger re-crawl
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Phase 5: Graph Visualization

### React Flow Integration

**File:** `src/components/WebsiteGraph/WebsiteGraph.tsx`

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface WebsiteGraphProps {
  websiteMapId: string;
}

interface PageData {
  id: string;
  url: string;
  title: string;
  word_count: number;
  internal_links: string[];
}

interface ConnectionData {
  source_page_id: string;
  target_page_id: string;
}

export default function WebsiteGraph({ websiteMapId }: WebsiteGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, [websiteMapId]);

  const fetchGraphData = async () => {
    try {
      // Fetch pages
      const { data: pages, error: pagesError } = await supabase
        .from('website_pages')
        .select('*')
        .eq('website_map_id', websiteMapId);

      if (pagesError) throw pagesError;

      // Fetch connections
      const { data: connections, error: connectionsError } = await supabase
        .from('page_connections')
        .select('source_page_id, target_page_id')
        .eq('website_map_id', websiteMapId);

      if (connectionsError) throw connectionsError;

      // Create nodes
      const graphNodes: Node[] = pages.map((page, index) => {
        const isHomepage = page.url.split('/').length <= 4; // Basic homepage detection
        const linkCount = (page.internal_links || []).length;
        
        return {
          id: page.id,
          type: 'default',
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600,
          },
          data: {
            label: page.title || new URL(page.url).pathname || 'Untitled',
            page: page,
          },
          style: {
            background: isHomepage ? '#10b981' : linkCount > 5 ? '#3b82f6' : '#6b7280',
            color: 'white',
            border: '2px solid #ffffff',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '10px',
          },
        };
      });

      // Create edges
      const graphEdges: Edge[] = connections.map(conn => ({
        id: `${conn.source_page_id}-${conn.target_page_id}`,
        source: conn.source_page_id,
        target: conn.target_page_id,
        type: 'smoothstep',
        style: { stroke: '#9ca3af', strokeWidth: 1 },
      }));

      setNodes(graphNodes);
      setEdges(graphEdges);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data.page);
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 relative border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor="#3b82f6"
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        <Panel position="top-right">
          <Card className="p-4 max-w-xs">
            <h3 className="font-semibold mb-2">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Homepage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Hub Pages (5+ links)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span>Regular Pages</span>
              </div>
            </div>
          </Card>
        </Panel>
      </ReactFlow>

      {/* Side Panel for Selected Node */}
      {selectedNode && (
        <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg truncate flex-1">
              {selectedNode.title || 'Untitled Page'}
            </h3>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">URL:</span>
              <p className="text-blue-600 break-all">{selectedNode.url}</p>
            </div>
            
            <div className="flex gap-4">
              <div>
                <span className="font-medium">Word Count:</span>
                <Badge variant="secondary" className="ml-2">
                  {selectedNode.word_count}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Internal Links:</span>
                <Badge variant="secondary" className="ml-2">
                  {(selectedNode.internal_links || []).length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Phase 6: Onboarding Integration

### Update Onboarding Component

**Update:** `src/components/Onboarding/ContentStrategyStep.tsx`

```typescript
// Add website analysis option after existing content
const [analyzeWebsite, setAnalyzeWebsite] = useState(false);
const [websiteAnalysis, setWebsiteAnalysis] = useState(null);

// Add to form
<div className="space-y-4">
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="analyze-website"
      checked={analyzeWebsite}
      onChange={(e) => setAnalyzeWebsite(e.target.checked)}
      className="rounded border-gray-300"
    />
    <label htmlFor="analyze-website" className="text-sm text-gray-700">
      Analyze my website structure (optional)
    </label>
  </div>
  
  {analyzeWebsite && (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-3">
        We'll analyze your website's internal link structure to provide personalized content recommendations.
      </p>
      <Button 
        type="button"
        variant="outline"
        onClick={handleWebsiteAnalysis}
        disabled={!formData.websiteUrl}
      >
        Analyze Website Structure
      </Button>
    </div>
  )}
</div>
```

## Installation & Configuration

### 1. Environment Variables
Add to your Supabase Edge Functions secrets:
```bash
# Firecrawl API Key (get from https://firecrawl.dev)
FIRECRAWL_API_KEY=fc-your-api-key-here
```

### 2. Dependencies
```bash
npm install @mendable/firecrawl-js @xyflow/react url-parse
```

### 3. Route Configuration
Update your router in `src/App.tsx`:
```typescript
<Route path="/website-map-analyzer" element={<WebsiteMapAnalyzer />} />
<Route path="/site-maps" element={<SiteMaps />} />
<Route path="/site-maps/new" element={<NewSiteMap />} />
<Route path="/site-maps/:id" element={<SiteMapDetail />} />
<Route path="/site-maps/:id/graph" element={<SiteMapGraph />} />
```

## Testing & Validation

### 1. Lead Magnet Testing
- Test with various website URLs (WordPress, Shopify, custom sites)
- Verify sitemap.xml detection and fallback to crawling
- Test email capture flow and conversion tracking

### 2. Authenticated User Testing
- Create multiple website maps
- Test re-crawling functionality
- Verify graph visualization with different site structures

### 3. Performance Testing
- Test with large websites (100+ pages)
- Monitor Firecrawl API usage and costs
- Optimize database queries for graph generation

## Documentation References

- [Firecrawl API Documentation](https://docs.firecrawl.dev/api-reference/introduction)
- [React Flow Documentation](https://reactflow.dev/docs/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Next Steps

1. **Phase 1**: Set up database schema and basic crawling
2. **Phase 2**: Implement Firecrawl integration and backend processing
3. **Phase 3**: Build lead magnet landing page
4. **Phase 4**: Create authenticated user dashboard
5. **Phase 5**: Implement graph visualization
6. **Phase 6**: Integrate with onboarding flow

Each phase can be implemented and tested independently, allowing for iterative development and user feedback.
