
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, outline, keywords = [], audience = '' } = await req.json();

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keywordText = keywords.length > 0 ? `Target keywords: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';

    const outlineText = outline.map((section: any, index: number) => 
      `${index + 1}. ${section.title}\n   - ${section.content}`
    ).join('\n');

    const prompt = `Write a comprehensive, engaging article based on the following specifications:

Title: ${title}
${keywordText}
${audienceText}

Outline:
${outlineText}

Requirements:
- Write a full article with detailed content for each section
- Use markdown formatting (headers, bold, italic, lists, etc.)
- Make it SEO-optimized and engaging
- Include practical examples and actionable advice
- Aim for 1500-2500 words total
- Use proper heading structure (# ## ###)
- Start with the title as an H1 heading`;

    console.log('Starting streaming content generation...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert content writer who creates comprehensive, SEO-optimized articles. Always use proper markdown formatting and structure.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        if (!reader) {
          controller.error(new Error('No response stream available'));
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send final complete content
              controller.enqueue(new TextEncoder().encode(
                `data: ${JSON.stringify({ 
                  type: 'complete', 
                  content: accumulatedContent 
                })}\n\n`
              ));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '' || !line.startsWith('data: ')) continue;
              
              const dataContent = line.slice(6).trim();
              
              if (dataContent === '[DONE]') {
                controller.enqueue(new TextEncoder().encode(
                  `data: ${JSON.stringify({ 
                    type: 'complete', 
                    content: accumulatedContent 
                  })}\n\n`
                ));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(dataContent);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  accumulatedContent += content;
                  
                  // Stream the incremental content
                  controller.enqueue(new TextEncoder().encode(
                    `data: ${JSON.stringify({ 
                      type: 'content', 
                      content: accumulatedContent,
                      delta: content
                    })}\n\n`
                  ));
                }
              } catch (parseError) {
                console.warn('Failed to parse OpenAI chunk:', parseError);
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ 
              type: 'error', 
              error: error.message 
            })}\n\n`
          ));
          controller.close();
        }
      },
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
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
