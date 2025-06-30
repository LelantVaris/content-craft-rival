
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
    
    console.log('Starting crawl for:', websiteUrl, 'User:', userId, 'Lead magnet:', isLeadMagnet);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Try to get sitemap first (much faster)
    console.log('Attempting to fetch sitemap for:', websiteUrl);
    const sitemapUrl = `${websiteUrl.replace(/\/$/, '')}/sitemap.xml`;
    
    let urls: string[] = [];
    
    try {
      const sitemapResponse = await fetch(sitemapUrl);
      if (sitemapResponse.ok) {
        const sitemapXml = await sitemapResponse.text();
        // Simple XML parsing for URLs
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
    if (urls.length === 0 && firecrawlApiKey) {
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
    
    console.log('Created website map:', websiteMap.id);
    
    // Step 4: Start Firecrawl crawl job for detailed content (if API key available)
    let crawlJobId = null;
    if (firecrawlApiKey) {
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
      
      if (crawlData.success) {
        crawlJobId = crawlData.id;
        
        // Update with crawl job ID
        await supabase
          .from('website_maps')
          .update({ 
            crawl_job_id: crawlJobId,
            crawl_data: crawlData 
          })
          .eq('id', websiteMap.id);
      }
    }
    
    // Step 5: For lead magnet, store preliminary data
    if (isLeadMagnet) {
      await supabase
        .from('lead_captures')
        .insert({
          website_url: websiteUrl,
          map_data: {
            total_urls: urls.length,
            crawl_job_id: crawlJobId,
            discovered_urls: urls.slice(0, 10), // Preview only
          },
        });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        websiteMapId: websiteMap.id,
        crawlJobId: crawlJobId,
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
