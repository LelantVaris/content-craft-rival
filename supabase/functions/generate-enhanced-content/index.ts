
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { streamText } from "npm:ai@4.3.16";
import { openai } from "npm:@ai-sdk/openai@1.3.22";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
          // Send initial status
          controller.enqueue(encoder.encode(createStreamEvent('status', {
            phase: 'draft',
            message: '🎯 Starting enhanced article generation...',
            progress: 0
          })));

          const outlineText = outline.map((section: any, index: number) => 
            `${index + 1}. ${section.title}\n   - ${section.content}`
          ).join('\n');

          const keywordText = keywords.length > 0 ? `\nTarget keywords: ${keywords.join(', ')}` : '';

          // Use AI SDK for streaming generation
          const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: `You are an expert content writer. Create a comprehensive article with clear sections. Use markdown formatting and write in a ${tone} tone.`,
            prompt: `Title: ${title}
Outline: ${outlineText}
Keywords: ${keywords.join(', ')}
Audience: ${audience}

Create a well-structured article draft with proper sections. Use markdown formatting and ensure each section has substantial content.${keywordText}`,
            temperature: 0.7,
            maxTokens: 3000,
          });

          let fullContent = '';
          let progress = 0;
          const totalSections = outline.length;

          // Process the AI SDK stream
          for await (const chunk of result.textStream) {
            fullContent += chunk;
            progress += 1;
            
            // Send progress updates
            controller.enqueue(encoder.encode(createStreamEvent('status', {
              phase: 'writing',
              message: `✍️ Generating content... (${Math.min(progress, 100)}%)`,
              progress: Math.min((progress / totalSections) * 100, 95)
            })));

            // Stream content updates
            controller.enqueue(encoder.encode(createStreamEvent('content', {
              sectionIndex: Math.floor(progress / 10),
              content: fullContent,
              status: 'writing'
            })));
          }

          // Final completion
          controller.enqueue(encoder.encode(createStreamEvent('complete', {
            content: fullContent.trim(),
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
