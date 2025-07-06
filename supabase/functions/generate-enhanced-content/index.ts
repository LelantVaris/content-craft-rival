
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
  type: 'status' | 'content' | 'complete' | 'error';
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
    const { 
      title, 
      outline, 
      keywords = [], 
      audience = '', 
      tone = 'professional',
      targetWordCount = 4000,
      pointOfView = 'second',
      brand = '',
      product = '',
      searchIntent = 'informational',
      primaryKeyword = '',
      length = 'medium',
      customWordCount
    } = await req.json();

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting enhanced content generation for:', title);
    console.log('Received parameters:', {
      targetWordCount,
      pointOfView,
      brand: brand ? 'provided' : 'not provided',
      product: product ? 'provided' : 'not provided',
      searchIntent,
      primaryKeyword,
      length,
      customWordCount
    });

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial status
          controller.enqueue(encoder.encode(createStreamEvent('status', {
            message: '🎯 Starting enhanced article generation...',
            progress: 0
          })));

          const outlineText = outline.map((section: any, index: number) => 
            `${index + 1}. ${section.title}\n   - ${section.content}`
          ).join('\n');

          const keywordText = keywords.length > 0 ? `\nTarget keywords: ${keywords.join(', ')}` : '';
          const primaryKeywordText = primaryKeyword ? `\nPrimary keyword: ${primaryKeyword}` : '';
          const brandContext = brand ? `\nBrand context: ${brand}` : '';
          const productContext = product ? `\nProduct/service context: ${product}` : '';
          
          // Calculate appropriate maxTokens based on target word count
          // Rough estimate: 1 word ≈ 1.3 tokens, plus buffer for formatting
          const finalWordCount = customWordCount || targetWordCount;
          const maxTokens = Math.min(Math.max(Math.round(finalWordCount * 1.5), 4000), 8000);

          console.log(`Target word count: ${finalWordCount}, Max tokens: ${maxTokens}`);

          // Use AI SDK for streaming generation
          const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: `You are an expert content writer. Create a comprehensive, well-structured article with clear sections. Use markdown formatting and write in a ${tone} tone for ${audience || 'general audience'}. Write in ${pointOfView} person perspective.`,
            prompt: `Write a complete article with the following specifications:

Title: ${title}

Target Word Count: ${finalWordCount} words (This is important - aim for approximately ${finalWordCount} words)

Outline: 
${outlineText}

Requirements:
- Write a full, comprehensive article following the outline structure
- Target approximately ${finalWordCount} words total
- Use proper markdown formatting with headers (##, ###)
- Write in ${pointOfView} person perspective (${pointOfView === 'first' ? 'I/we' : pointOfView === 'second' ? 'you' : 'they/it'})
- Include engaging introductions and conclusions for each section
- Write in ${tone} tone for ${audience || 'general audience'}
- Search intent: ${searchIntent} - tailor content accordingly
- Incorporate these keywords naturally: ${keywords.join(', ')}${primaryKeywordText}
- Create smooth transitions between sections${keywordText}${brandContext}${productContext}
- Ensure substantial, informative content in each section to meet the ${finalWordCount} word target
- Include actionable insights and practical examples where relevant

Write the complete article now:`,
            temperature: 0.7,
            maxTokens: maxTokens,
          });

          let fullContent = '';
          let progress = 0;
          let chunkCount = 0;

          // Process the AI SDK stream
          for await (const chunk of result.textStream) {
            fullContent += chunk;
            chunkCount++;
            
            // Send progress updates more frequently - every 5 chunks
            if (chunkCount % 5 === 0) {
              progress = Math.min(chunkCount * 3, 95); // More gradual progress
              controller.enqueue(encoder.encode(createStreamEvent('status', {
                message: `✍️ Writing comprehensive content... (${progress}%)`,
                progress: progress
              })));
            }

            // Stream content updates every 10 chunks for smoother experience
            if (chunkCount % 10 === 0) {
              controller.enqueue(encoder.encode(createStreamEvent('content', {
                content: fullContent,
                status: 'writing'
              })));
            }
          }

          // Final completion
          controller.enqueue(encoder.encode(createStreamEvent('complete', {
            content: fullContent.trim(),
            message: `🎉 Article generation complete! Generated ${fullContent.trim().split(' ').length} words.`,
            progress: 100
          })));

          console.log(`Generation complete. Final word count: ${fullContent.trim().split(' ').length}`);

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
