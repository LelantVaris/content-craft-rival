
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      topic, 
      audience = '',
      count = 8
    } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
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
          p_amount: 1,
          p_tool_used: 'keyword_generation',
          p_description: `Generated keywords for: ${topic}`
        });

        if (!creditResult) {
          return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    const audienceText = audience ? `Target audience: ${audience}` : '';

    const systemPrompt = `You are an expert SEO strategist who identifies high-value keywords for content marketing. Generate keywords that are:

1. **Search-Intent Focused**: Keywords people actually search for
2. **Commercially Valuable**: Mix of informational and commercial intent
3. **Competitively Viable**: Not overly competitive single words
4. **Audience-Specific**: Tailored to the target audience
5. **Varied Length**: Mix of short-tail (1-2 words) and long-tail (3+ words)

Return exactly ${count} keywords as a comma-separated list with no additional text.`;

    const userPrompt = `Generate ${count} relevant SEO keywords for this topic:

Topic: ${topic}
${audienceText}

Requirements:
- Focus on keywords that people would actually search for
- Include both short-tail (1-2 words) and long-tail (3+ words) keywords
- Consider search intent and commercial value
- Make them specific to the topic and audience
- Include variations and related terms
- Avoid overly competitive single words
- Ensure keywords are relevant for article content

Return exactly ${count} keywords as a comma-separated list:`;

    console.log('Starting AI SDK keyword generation for:', topic);

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
      maxTokens: 300,
    });

    // Parse the generated keywords
    const keywordText = result.text.trim();
    const keywords = keywordText
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0 && keyword.length < 100) // Filter out overly long "keywords"
      .slice(0, count); // Limit to requested count

    console.log('Generated keywords:', keywords);

    if (keywords.length === 0) {
      throw new Error('No keywords were generated');
    }

    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-keywords function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Keyword generation failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
