
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
    
    console.log('Checking crawl status for job:', crawlJobId, 'map:', websiteMapId);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check crawl status with Firecrawl (if API key available)
    let statusData = null;
    if (firecrawlApiKey && crawlJobId) {
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlJobId}`, {
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      statusData = await statusResponse.json();
      
      if (!statusData.success) {
        throw new Error(`Status check failed: ${statusData.error}`);
      }
      
      console.log('Crawl status:', statusData.status, 'Completed:', statusData.completed, 'Total:', statusData.total);
    }
    
    // Update website map with current status
    const updateData: any = {
      last_crawl_date: new Date().toISOString(),
    };
    
    if (statusData) {
      updateData.crawl_status = statusData.status;
      updateData.crawled_pages = statusData.completed || 0;
    }
    
    await supabase
      .from('website_maps')
      .update(updateData)
      .eq('id', websiteMapId);
    
    // If completed, process the crawled data
    if (statusData && statusData.status === 'completed' && statusData.data) {
      console.log('Processing completed crawl data...');
      await processCrawledData(supabase, websiteMapId, statusData.data);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        status: statusData?.status || 'completed',
        completed: statusData?.completed || 0,
        total: statusData?.total || 0,
        data: statusData?.status === 'completed' ? statusData.data : null,
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
  const pages = crawlData.map(page => {
    const sourceUrl = page.metadata?.sourceURL || page.url;
    const linksOnPage = page.linksOnPage || [];
    
    // Filter internal vs external links
    let internalLinks: string[] = [];
    let externalLinks: string[] = [];
    
    try {
      const sourceHost = new URL(sourceUrl).hostname;
      
      linksOnPage.forEach((link: string) => {
        try {
          const linkUrl = new URL(link, sourceUrl); // Handle relative URLs
          if (linkUrl.hostname === sourceHost) {
            internalLinks.push(linkUrl.href);
          } else {
            externalLinks.push(linkUrl.href);
          }
        } catch {
          // Invalid URL, skip
        }
      });
    } catch (error) {
      console.error('Error processing links for:', sourceUrl, error);
    }
    
    return {
      website_map_id: websiteMapId,
      url: sourceUrl,
      title: page.metadata?.title || '',
      meta_description: page.metadata?.description || '',
      content_summary: page.markdown?.substring(0, 500) || '',
      word_count: page.markdown ? page.markdown.split(' ').length : 0,
      internal_links: internalLinks,
      external_links: externalLinks,
      crawl_data: {
        metadata: page.metadata,
        linksOnPage: page.linksOnPage,
      },
    };
  });
  
  const { data: insertedPages, error } = await supabase
    .from('website_pages')
    .upsert(pages, { onConflict: 'website_map_id,url' })
    .select();
    
  if (error) {
    console.error('Error inserting pages:', error);
    return;
  }
  
  console.log(`Inserted ${insertedPages.length} pages`);
  
  // Create page connections based on internal links
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
    const { error: connectionsError } = await supabase
      .from('page_connections')
      .upsert(connections, { onConflict: 'source_page_id,target_page_id' });
      
    if (connectionsError) {
      console.error('Error inserting connections:', connectionsError);
    } else {
      console.log(`Created ${connections.length} page connections`);
    }
  }
  
  // Update website map status
  await supabase
    .from('website_maps')
    .update({ crawl_status: 'completed' })
    .eq('id', websiteMapId);
    
  console.log(`Processing complete: ${pages.length} pages, ${connections.length} connections`);
}
