
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { streamText } from "npm:ai@4.3.16";
import { openai } from "npm:@ai-sdk/openai@1.3.22";
import { createClient } from "https://deno.land/x/supabase@1.2.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== CONTENT GENERATION AI SDK - STREAMING VERSION ===');
  console.log('Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate OpenAI API key
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request received:', { 
        title: requestBody.title,
        outlineLength: requestBody.outline?.length || 0,
        keywordCount: requestBody.keywords?.length || 0,
        audience: !!requestBody.audience 
      });
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid request format. Please check your request body.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
    } = requestBody;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      console.error('Title missing or invalid');
      return new Response(JSON.stringify({ 
        error: 'Title is required and must be a non-empty string' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits first (if user is authenticated)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        console.log('Deducting credits for user:', user.id);
        const { data: creditResult } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: 5,
          p_tool_used: 'content_generation',
          p_description: `Generated content for: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`
        });

        if (!creditResult) {
          console.error('Insufficient credits for user:', user.id);
          return new Response(JSON.stringify({ 
            error: 'Insufficient credits. Please upgrade your plan or purchase more credits.' 
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log('Credits deducted successfully');
      }
    }

    // Build enhanced PVOD prompt
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

Write in ${pointOfView} person perspective with a ${tone} tone. Target word count: ~${targetWordCount} words.

Use proper markdown formatting including headers (# ## ###), **bold text**, *italic text*, bullet points, and numbered lists for maximum readability.`;

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
- Make it scannable with clear subheadings

Write the complete article now:`;

    console.log('Starting AI SDK streaming content generation...');
    
    // Use AI SDK for streaming
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 4000,
      temperature: 0.7,
      presencePenalty: 0.1,
      frequencyPenalty: 0.1,
    });

    console.log('AI SDK streaming initialized successfully');

    // Return streaming response
    return new Response(result.toDataStreamResponse().body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
