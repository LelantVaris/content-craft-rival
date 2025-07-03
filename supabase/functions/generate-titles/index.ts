
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { openai } from 'https://esm.sh/@ai-sdk/openai@1.3.22';
import { generateText } from 'https://esm.sh/ai@4.3.16';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== GENERATE TITLES FUNCTION START ===');
  console.log('Request method:', req.method);
  console.log('OpenAI API Key present:', !!openAIApiKey);
  console.log('Supabase URL present:', !!supabaseUrl);
  console.log('Service Key present:', !!supabaseServiceKey);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    if (!openAIApiKey) {
      console.error('CRITICAL ERROR: OPENAI_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing request body...');
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);

    const { 
      topic, 
      keywords = [], 
      audience = '', 
      count = 5 
    } = requestBody;

    console.log('Extracted parameters:', { topic, keywords, audience, count });

    if (!topic) {
      console.error('ERROR: Topic is required but not provided');
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating Supabase client...');
    // Deduct credits first
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (authHeader) {
      console.log('Processing authentication...');
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error('Auth error:', userError);
        return new Response(JSON.stringify({ error: 'Authentication failed' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (user) {
        console.log('User authenticated:', user.id);
        console.log('Attempting to deduct credits...');
        
        const { data: creditResult, error: creditError } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: 2,
          p_tool_used: 'title_generation',
          p_description: `Generated ${count} titles for: ${topic}`
        });

        console.log('Credit deduction result:', creditResult);
        console.log('Credit deduction error:', creditError);

        if (creditError) {
          console.error('Credit deduction failed:', creditError);
          return new Response(JSON.stringify({ error: 'Credit deduction failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!creditResult) {
          console.error('Insufficient credits');
          return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log('Credits deducted successfully');
      }
    } else {
      console.log('No auth header - proceeding without credit deduction');
    }

    // Build context for better title generation
    const keywordText = keywords.length > 0 ? `Keywords to consider: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';
    
    const systemPrompt = `You are an expert content strategist specializing in creating compelling, SEO-optimized article titles. Generate titles that are:

1. **Click-worthy**: Compelling and engaging to drive clicks
2. **SEO-optimized**: Include relevant keywords naturally
3. **Audience-focused**: Tailored to the target audience
4. **Varied**: Different angles and approaches
5. **Professional**: Appropriate for business/marketing content

Return exactly ${count} titles, one per line, with no numbering or formatting.`;

    const userPrompt = `Generate ${count} compelling article titles for this topic:

Topic: ${topic}
${keywordText}
${audienceText}

Requirements:
- Make titles engaging and click-worthy
- Include relevant keywords naturally (don't force them)
- Vary the approach (how-to, listicle, guide, strategy, etc.)
- Keep titles between 40-60 characters for SEO
- Make them specific and actionable
- Appeal to the target audience

Generate exactly ${count} titles, one per line:`;

    console.log('Starting AI SDK title generation for topic:', topic);
    console.log('System prompt length:', systemPrompt.length);
    console.log('User prompt length:', userPrompt.length);

    try {
      const result = await generateText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.8,
        maxTokens: 500,
      });

      console.log('AI generation completed successfully');
      console.log('Generated text length:', result.text.length);
      console.log('Generated text preview:', result.text.substring(0, 200));

      // Parse the generated titles
      const titlesText = result.text.trim();
      const titles = titlesText
        .split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0)
        .slice(0, count); // Ensure we don't exceed requested count

      console.log('Parsed titles count:', titles.length);
      console.log('Generated titles:', titles);

      if (titles.length === 0) {
        console.error('ERROR: No titles were generated from AI response');
        throw new Error('No titles were generated');
      }

      console.log('=== GENERATE TITLES FUNCTION SUCCESS ===');
      return new Response(JSON.stringify({ titles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (aiError) {
      console.error('AI SDK Error Details:', {
        message: aiError.message,
        stack: aiError.stack,
        name: aiError.name
      });
      throw aiError;
    }

  } catch (error) {
    console.error('=== GENERATE TITLES FUNCTION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Title generation failed',
      details: error.toString(),
      type: error.name || 'Unknown Error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
