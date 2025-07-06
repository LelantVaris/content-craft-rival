
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
      audience = 'general audience', 
      tone = 'professional',
      targetWordCount = 4000,
      pointOfView = 'second',
      brand = '',
      product = '',
      searchIntent = 'informational'
    } = await req.json();

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting enhanced content generation for:', title);
    console.log('Target word count:', targetWordCount);
    console.log('Content preferences:', { tone, audience, pointOfView, brand, product, searchIntent });

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial status
          controller.enqueue(encoder.encode(createStreamEvent('status', {
            message: '🎯 Starting enhanced article generation with your preferences...',
            progress: 0
          })));

          const outlineText = outline.map((section: any, index: number) => 
            `${index + 1}. ${section.title}\n   - ${section.content}`
          ).join('\n');

          const keywordText = keywords.length > 0 ? `\nTarget keywords: ${keywords.join(', ')}` : '';
          const brandText = brand ? `\nBrand: ${brand}` : '';
          const productText = product ? `\nProduct/Service: ${product}` : '';

          // Enhanced prompt with all content preferences
          const systemPrompt = `You are an expert content writer. Create a comprehensive, well-structured article with clear sections. 

CRITICAL REQUIREMENTS:
- Target word count: ${targetWordCount} words (THIS IS VERY IMPORTANT - write a substantial article)
- Writing style: ${tone} tone for ${audience}
- Point of view: Write in ${pointOfView} person perspective
- Search intent: Optimize for ${searchIntent} search intent
- Use proper markdown formatting with headers (##, ###)
- Create engaging, detailed content in each section
- Include smooth transitions between sections${brandText}${productText}

Write a COMPREHENSIVE article that reaches the target word count through detailed explanations, examples, and thorough coverage of each topic.`;

          const userPrompt = `Write a complete ${targetWordCount}-word article with the following specifications:

Title: ${title}

Outline Structure: 
${outlineText}

Additional Requirements:
- Write in ${pointOfView} person perspective
- Use ${tone} tone throughout
- Target audience: ${audience}
- Search intent: ${searchIntent}
- Include these keywords naturally: ${keywords.join(', ')}
- IMPORTANT: Write ${targetWordCount} words - provide comprehensive, detailed content${keywordText}${brandText}${productText}

Write the complete, detailed article now with substantial content in each section:`;

          // Calculate max tokens based on target word count (roughly 1.3 tokens per word)
          const maxTokens = Math.min(8000, Math.max(4000, Math.round(targetWordCount * 1.5)));

          console.log('Using maxTokens:', maxTokens, 'for target word count:', targetWordCount);

          // Use AI SDK for streaming generation
          const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: systemPrompt,
            prompt: userPrompt,
            temperature: 0.7,
            maxTokens: maxTokens,
          });

          let fullContent = '';
          let chunkCount = 0;

          // Process the AI SDK stream with improved frequency
          for await (const chunk of result.textStream) {
            fullContent += chunk;
            chunkCount++;
            
            // Send progress updates every 3 chunks for smoother streaming
            if (chunkCount % 3 === 0) {
              const estimatedProgress = Math.min(95, Math.round((fullContent.length / (targetWordCount * 5)) * 100));
              
              controller.enqueue(encoder.encode(createStreamEvent('status', {
                message: `✍️ Writing detailed content... (~${Math.round(fullContent.length / 5)} words so far)`,
                progress: estimatedProgress
              })));
            }

            // Stream content updates more frequently
            if (chunkCount % 2 === 0) {
              controller.enqueue(encoder.encode(createStreamEvent('content', {
                content: fullContent,
                status: 'writing'
              })));
            }
          }

          // Final word count check
          const finalWordCount = fullContent.trim().split(/\s+/).length;
          console.log('Final article word count:', finalWordCount, 'Target was:', targetWordCount);

          // Final completion
          controller.enqueue(encoder.encode(createStreamEvent('complete', {
            content: fullContent.trim(),
            message: `🎉 Article complete! Generated ${finalWordCount} words with your preferences applied.`,
            progress: 100,
            wordCount: finalWordCount
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
