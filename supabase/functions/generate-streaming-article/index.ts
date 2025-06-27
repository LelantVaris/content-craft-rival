
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamEvent {
  type: 'section-start' | 'content-chunk' | 'section-complete' | 'complete' | 'error';
  data: any;
}

function createStreamEvent(type: StreamEvent['type'], data: any): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

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
        limit: 2,
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
      return { content: text.substring(0, 1500), url };
    }).filter(item => item.content);

    console.log(`Found ${content.length} search results for query: ${query}`);
    return content;
  } catch (error) {
    console.error('Error searching with Firecrawl:', error);
    return [];
  }
}

async function generateSectionWithSources(
  sectionTitle: string,
  sectionDescription: string,
  researchData: any[],
  keywords: string[],
  tone: string = 'professional'
): Promise<ReadableStream> {
  const researchContext = researchData.map(item => 
    `Content: ${item.content}\nSource: ${item.url}`
  ).join('\n\n---\n\n');
  
  const keywordText = keywords.length > 0 ? `\nTarget keywords to include naturally: ${keywords.join(', ')}` : '';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert content writer. Write engaging, well-researched content with inline source links. Use markdown formatting and write in a ${tone} tone. When referencing information from sources, include inline links like [relevant text](source-url). Do not add a separate sources section at the end.`
        },
        {
          role: 'user',
          content: `Write a comprehensive section for "${sectionTitle}".

Description: ${sectionDescription}

Research Sources:
${researchContext}

Instructions:
- Write engaging, informative content
- Include inline links to sources when referencing specific information
- Use proper markdown formatting (headers, lists, bold, italic)
- Write in ${tone} tone
- Make content actionable and valuable${keywordText}
- Do NOT add a separate sources section at the end

Section Content:`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    }),
  });

  return response.body!;
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

    console.log('Starting streaming article generation for:', title);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          let fullArticle = `# ${title}\n\n`;

          // Process each section
          for (let i = 0; i < outline.length; i++) {
            const section = outline[i];
            const sectionTitle = section.title;
            const sectionDescription = section.content || section.description || '';

            // Signal section start
            controller.enqueue(encoder.encode(createStreamEvent('section-start', {
              index: i,
              title: sectionTitle,
              totalSections: outline.length
            })));

            // Generate search queries for research
            const searchQueries = [
              `${sectionTitle} ${keywords.slice(0, 2).join(' ')}`,
              `${sectionDescription} latest research statistics`
            ];

            // Perform research
            const researchData = [];
            for (const query of searchQueries) {
              const results = await searchWithFirecrawl(query);
              researchData.push(...results);
            }

            // Generate section content with streaming
            const sectionStream = await generateSectionWithSources(
              sectionTitle,
              sectionDescription,
              researchData,
              keywords,
              tone
            );

            const reader = sectionStream.getReader();
            const decoder = new TextDecoder();
            let sectionContent = `\n## ${sectionTitle}\n\n`;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    const content = data.choices?.[0]?.delta?.content || '';
                    
                    if (content) {
                      sectionContent += content;
                      fullArticle += content;
                      
                      // Stream each character chunk
                      controller.enqueue(encoder.encode(createStreamEvent('content-chunk', {
                        sectionIndex: i,
                        chunk: content,
                        fullContent: fullArticle
                      })));
                    }
                  } catch (parseError) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            // Signal section complete
            controller.enqueue(encoder.encode(createStreamEvent('section-complete', {
              index: i,
              title: sectionTitle
            })));
          }

          // Signal complete
          controller.enqueue(encoder.encode(createStreamEvent('complete', {
            content: fullArticle,
            message: 'Article generation complete!'
          })));

        } catch (error) {
          console.error('Error in streaming generation:', error);
          controller.enqueue(encoder.encode(createStreamEvent('error', {
            error: error.message
          })));
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
    console.error('Error in generate-streaming-article function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
