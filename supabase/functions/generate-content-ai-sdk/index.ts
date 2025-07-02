
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { openai } from 'https://esm.sh/@ai-sdk/openai@1.3.22';
import { streamText } from 'https://esm.sh/ai@4.3.16';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      title, 
      outline, 
      keywords = [], 
      primaryKeyword = '',
      audience = '', 
      tone = 'professional',
      targetWordCount = 4000,
      searchIntent = 'informational',
      brand = '',
      product = '',
      pointOfView = 'second'
    } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits first
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: creditResult } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: 5,
          p_tool_used: 'content_generation',
          p_description: `Generated article: ${title}`
        });

        if (!creditResult) {
          return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Build PVOD-based prompt
    const effectivePrimaryKeyword = primaryKeyword || keywords[0] || '';
    const secondaryKeywords = keywords.filter(k => k !== effectivePrimaryKeyword);
    
    const keywordText = effectivePrimaryKeyword ? `Primary keyword: ${effectivePrimaryKeyword}` : '';
    const secondaryText = secondaryKeywords.length > 0 ? `Secondary keywords: ${secondaryKeywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';
    const brandText = brand ? `Brand context: ${brand}` : '';
    const productText = product ? `Product/service context: ${product}` : '';
    
    let outlineText = '';
    if (outline && outline.length > 0) {
      outlineText = outline.map((section: any, index: number) => 
        `${index + 1}. ${section.title}\n   - ${section.content}`
      ).join('\n');
    }

    // PVOD Article Generation Prompt
    const systemPrompt = `You are an expert content writer specializing in PVOD content creation (Personality, Value, Opinion, Direct). Create comprehensive, engaging articles that:

PERSONALITY: Inject authentic voice and relatable human elements
VALUE: Provide actionable insights and practical takeaways
OPINION: Include thoughtful perspectives and expert viewpoints
DIRECT: Use clear, conversational language that speaks directly to the reader

Write in ${pointOfView} person perspective with a ${tone} tone. Target word count: ~${targetWordCount} words.`;

    const userPrompt = `Write a comprehensive PVOD-style article based on these specifications:

Title: ${title}
${keywordText}
${secondaryText}
${audienceText}
${brandText}
${productText}
Search Intent: ${searchIntent}

${outlineText ? `Outline:\n${outlineText}\n` : ''}

PVOD Requirements:
- PERSONALITY: Use conversational tone, personal anecdotes, and relatable examples
- VALUE: Include 3-5 actionable takeaways, practical tips, and real-world applications
- OPINION: Share expert insights, industry perspectives, and thought-provoking viewpoints
- DIRECT: Write as if speaking directly to one person, use "you" naturally

Structure Requirements:
- Start with an engaging hook that connects with the reader personally
- Use proper markdown formatting (# ## ### headers, **bold**, *italic*, lists)
- Include practical examples and case studies
- Add 2-3 expert tips or "pro tips" throughout
- End with a compelling call-to-action
- Naturally integrate keywords for SEO without keyword stuffing

Content Guidelines:
- Target ${targetWordCount} words total
- Use short paragraphs (2-3 sentences max)
- Include bullet points and numbered lists for readability
- Add relevant questions that readers might ask
- Make it scannable with clear subheadings`;

    console.log('Starting AI SDK streaming content generation for:', title);

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const delta of result.textStream) {
            const chunk = `data: ${JSON.stringify({ content: delta })}\n\n`;
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
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
    console.error('Error in generate-content-ai-sdk function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Content generation failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
