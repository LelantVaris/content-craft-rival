
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamEvent {
  type: 'status' | 'section' | 'research' | 'content' | 'complete' | 'error';
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
        limit: 3,
      }),
    });

    if (!searchResponse.ok) {
      console.error('Firecrawl search failed:', searchResponse.statusText);
      return [];
    }

    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    
    // Extract content from search results
    const content = results.map((result: any) => {
      const text = result.content || result.markdown || '';
      // Limit content length to avoid token limits
      return text.substring(0, 2000);
    }).filter(Boolean);

    console.log(`Found ${content.length} search results for query: ${query}`);
    return content;
  } catch (error) {
    console.error('Error searching with Firecrawl:', error);
    return [];
  }
}

async function generateSearchQueries(sectionTitle: string, sectionContent: string): Promise<string[]> {
  try {
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
            content: 'You are an expert researcher. Generate 2-3 specific, focused search queries to find the most current and relevant information for the given article section. Return only the search queries, one per line, without numbering or formatting.'
          },
          {
            role: 'user',
            content: `Section Title: ${sectionTitle}\n\nSection Content: ${sectionContent}\n\nGenerate search queries to find current information, statistics, examples, and insights for this section:`
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const queries = data.choices[0].message.content
      .split('\n')
      .map((q: string) => q.trim())
      .filter(Boolean)
      .slice(0, 3);

    console.log(`Generated ${queries.length} search queries for section: ${sectionTitle}`);
    return queries;
  } catch (error) {
    console.error('Error generating search queries:', error);
    return [];
  }
}

async function enhanceSectionWithResearch(
  sectionTitle: string,
  originalContent: string,
  researchData: string[],
  keywords: string[],
  tone: string = 'professional'
): Promise<string> {
  const researchContext = researchData.join('\n\n---\n\n');
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
          content: `You are an expert content writer. Enhance the given section with current research data, statistics, and insights. Write in a ${tone} tone and make the content engaging and informative. Use proper markdown formatting.`
        },
        {
          role: 'user',
          content: `Section Title: ${sectionTitle}

Original Content:
${originalContent}

Research Data:
${researchContext}

Instructions:
- Enhance the section with current information from the research data
- Include relevant statistics, examples, and insights
- Maintain the section's structure and purpose
- Write in ${tone} tone
- Use proper markdown formatting (headers, lists, bold, italic)
- Make it engaging and actionable${keywordText}

Enhanced Section:`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
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

    console.log('Starting enhanced content generation for:', title);

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Phase 1: Generate initial draft
          controller.enqueue(encoder.encode(createStreamEvent('status', {
            phase: 'draft',
            message: '🎯 Generating initial article draft...',
            progress: 0
          })));

          const outlineText = outline.map((section: any, index: number) => 
            `${index + 1}. ${section.title}\n   - ${section.content}`
          ).join('\n');

          const draftResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: `You are an expert content writer. Create a comprehensive article draft with clear sections. Use markdown formatting and write in a ${tone} tone.`
                },
                {
                  role: 'user',
                  content: `Title: ${title}
Outline: ${outlineText}
Keywords: ${keywords.join(', ')}
Audience: ${audience}

Create a well-structured article draft with proper sections. Use markdown formatting and ensure each section has substantial content.`
                }
              ],
              temperature: 0.7,
              max_tokens: 3000,
            }),
          });

          const draftData = await draftResponse.json();
          const draftContent = draftData.choices[0].message.content;

          // Parse draft into sections
          const sections = draftContent.split(/(?=^##\s)/m).filter(Boolean);
          
          controller.enqueue(encoder.encode(createStreamEvent('status', {
            phase: 'research',
            message: '📚 Starting research-enhanced generation...',
            progress: 20,
            totalSections: sections.length
          })));

          let finalContent = '';
          
          // Process each section
          for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionTitle = section.match(/^##\s+(.+)$/m)?.[1] || `Section ${i + 1}`;
            const isConclusion = /conclusion|summary|final|wrap.?up/i.test(sectionTitle);

            controller.enqueue(encoder.encode(createStreamEvent('section', {
              index: i,
              title: sectionTitle,
              status: 'processing',
              isConclusion
            })));

            if (isConclusion) {
              // Skip research for conclusion sections
              controller.enqueue(encoder.encode(createStreamEvent('status', {
                phase: 'writing',
                message: `✍️ Writing ${sectionTitle} (no research needed)...`,
                sectionIndex: i,
                progress: 20 + (i / sections.length) * 70
              })));

              finalContent += section + '\n\n';
            } else {
              // Generate search queries
              controller.enqueue(encoder.encode(createStreamEvent('research', {
                sectionIndex: i,
                status: 'generating_queries',
                message: `🔍 Generating search queries for ${sectionTitle}...`
              })));

              const searchQueries = await generateSearchQueries(sectionTitle, section);
              
              // Perform research
              controller.enqueue(encoder.encode(createStreamEvent('research', {
                sectionIndex: i,
                status: 'searching',
                message: `📡 Researching: ${searchQueries.join(', ')}`,
                queries: searchQueries
              })));

              const researchData = [];
              for (const query of searchQueries) {
                const results = await searchWithFirecrawl(query);
                researchData.push(...results);
              }

              // Enhance section with research
              controller.enqueue(encoder.encode(createStreamEvent('status', {
                phase: 'enhancing',
                message: `✨ Enhancing ${sectionTitle} with research insights...`,
                sectionIndex: i,
                progress: 20 + (i / sections.length) * 70
              })));

              const enhancedSection = await enhanceSectionWithResearch(
                sectionTitle,
                section,
                researchData,
                keywords,
                tone
              );

              finalContent += enhancedSection + '\n\n';
            }

            // Stream the completed section
            controller.enqueue(encoder.encode(createStreamEvent('content', {
              sectionIndex: i,
              title: sectionTitle,
              content: finalContent,
              status: 'complete'
            })));
          }

          // Final completion
          controller.enqueue(encoder.encode(createStreamEvent('complete', {
            content: finalContent.trim(),
            message: '🎉 Article generation complete!',
            progress: 100
          })));

        } catch (error) {
          console.error('Error in enhanced generation:', error);
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
    console.error('Error in generate-enhanced-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
