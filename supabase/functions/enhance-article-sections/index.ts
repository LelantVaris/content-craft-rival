
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function searchSectionResearch(query: string): Promise<string[]> {
  try {
    console.log('Searching research for section:', query);
    
    if (!firecrawlApiKey) {
      console.log('Firecrawl API key not available, skipping research');
      return [];
    }
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        pageOptions: {
          onlyMainContent: true,
          includeHtml: false,
          waitFor: 1000,
        },
        limit: 5,
      }),
    });

    if (!searchResponse.ok) {
      console.error('Firecrawl search failed:', searchResponse.statusText);
      return [];
    }

    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    
    const content = results.map((result: any) => {
      const text = result.content || result.markdown || '';
      const url = result.url || '';
      return { content: text.substring(0, 1000), url };
    }).filter(item => item.content);

    console.log(`Found ${content.length} research results for section query`);
    return content;
  } catch (error) {
    console.error('Error searching section research:', error);
    return [];
  }
}

async function enhanceSection(sectionTitle: string, sectionContent: string, researchData: any[], keywords: string[], audience: string, tone: string): Promise<string> {
  const researchContext = researchData.length > 0 
    ? `\n\nResearch context:\n${researchData.map(item => `- ${item.content}\n  Source: ${item.url}`).join('\n')}`
    : '';

  const prompt = `Enhance this article section with research insights and maintain SEO optimization.

Section Title: ${sectionTitle}
Current Content: ${sectionContent}

Enhancement Requirements:
- Target audience: ${audience}
- Tone: ${tone}
- Keywords to include naturally: ${keywords.join(', ')} (1-3% density)
- Add relevant statistics, examples, and insights
- Include source citations where appropriate
- Maintain professional formatting
- Keep the section focused and readable

${researchContext}

Rewrite the section to be more comprehensive and research-backed while maintaining the original structure and flow:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are an expert content writer who enhances article sections with research insights while maintaining SEO and tone consistency.` },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || sectionContent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { basicArticle, outline, keywords = [], audience = '', tone = 'professional' } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!basicArticle || !outline || outline.length === 0) {
      throw new Error('Basic article and outline are required');
    }

    console.log('Starting section-by-section enhancement...');

    // Create a stream for server-sent events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Starting section enhancement...',
            progress: 0
          })}\n\n`));

          // Process each section
          for (let i = 0; i < outline.length; i++) {
            const section = outline[i];
            const progress = ((i + 1) / outline.length) * 100;
            
            // Send section start status
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              sectionTitle: section.title,
              sectionIndex: i,
              progress: Math.round(progress * 0.3) // Research phase is 30%
            })}\n\n`));

            // Generate research query for this section
            const researchQuery = `${section.title} ${keywords.slice(0, 2).join(' ')} latest research statistics`;
            
            // Search for research
            const researchData = await searchSectionResearch(researchQuery);
            
            // Send research complete status
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'research-complete',
              sectionTitle: section.title,
              sectionIndex: i,
              researchCount: researchData.length,
              progress: Math.round(progress * 0.6) // Enhancement phase is 60%
            })}\n\n`));

            // Enhance the section
            const enhancedContent = await enhanceSection(
              section.title,
              section.content,
              researchData,
              keywords,
              audience,
              tone
            );

            // Send enhanced section
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-enhanced',
              sectionTitle: section.title,
              sectionIndex: i,
              enhancedContent,
              sources: researchData.map(item => item.url).filter(Boolean),
              progress: Math.round(progress)
            })}\n\n`));
          }

          // Send completion status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            message: 'All sections enhanced successfully!',
            progress: 100
          })}\n\n`));

        } catch (error) {
          console.error('Error in section enhancement:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: error.message || 'Enhancement failed'
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in enhance-article-sections function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
