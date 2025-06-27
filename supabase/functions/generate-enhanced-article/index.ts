
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { openai } from "npm:@ai-sdk/openai@latest";
import { streamText, tool } from "npm:ai@latest";
import { z } from "npm:zod@latest";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function searchWithFirecrawl(query: string): Promise<string[]> {
  try {
    console.log('Searching with Firecrawl for:', query);
    
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
        limit: 3,
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
      return text.substring(0, 2000);
    }).filter(Boolean);

    console.log(`Found ${content.length} search results for query: ${query}`);
    return content;
  } catch (error) {
    console.error('Error searching with Firecrawl:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, outline, keywords = [], audience = '', tone = 'professional' } = await req.json();

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting enhanced article generation for:', title);

    const outlineText = outline.map((section: any, index: number) => 
      `${index + 1}. ${section.title}\n   - ${section.content}`
    ).join('\n');

    const result = await streamText({
      model: openai('gpt-4o-mini', { apiKey: openAIApiKey }),
      system: `You are an expert content writer creating comprehensive, research-enhanced articles. 

Write in a ${tone} tone for this audience: ${audience || 'general audience'}.

Your task:
1. Create a well-structured article based on the provided outline
2. Use the research tools to find current information for each section
3. Integrate research findings naturally into the content
4. Use proper markdown formatting
5. Include relevant statistics, examples, and insights from research
6. Target keywords naturally: ${keywords.join(', ')}

Structure your response as a complete article with proper sections and subsections.`,
      prompt: `Create a comprehensive article with this information:

Title: ${title}
Outline: ${outlineText}
Keywords: ${keywords.join(', ')}
Audience: ${audience}

Please research current information for each section and create an engaging, informative article.`,
      tools: {
        researchSection: tool({
          description: 'Research current information for a specific article section',
          parameters: z.object({
            sectionTitle: z.string().describe('The title of the section to research'),
            searchQuery: z.string().describe('The search query to find relevant information'),
          }),
          execute: async ({ sectionTitle, searchQuery }) => {
            console.log(`Researching section: ${sectionTitle} with query: ${searchQuery}`);
            const results = await searchWithFirecrawl(searchQuery);
            return {
              sectionTitle,
              researchData: results,
              summary: results.length > 0 ? 'Found relevant research data' : 'No research data found'
            };
          },
        }),
      },
    });

    // Convert the AI SDK stream to Server-Sent Events format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of result.textStream) {
            const sseData = `data: ${JSON.stringify({
              type: 'content',
              data: { content: chunk }
            })}\n\n`;
            
            controller.enqueue(encoder.encode(sseData));
          }
          
          // Send completion event
          const completeData = `data: ${JSON.stringify({
            type: 'complete',
            data: { message: 'Article generation complete!' }
          })}\n\n`;
          
          controller.enqueue(encoder.encode(completeData));
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            data: { error: error.message }
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorData));
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
    console.error('Error in generate-enhanced-article function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
