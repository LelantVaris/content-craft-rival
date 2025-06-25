
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
    const { topic, audience = '' } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audienceContext = audience ? `Target audience: ${audience}` : '';

    const prompt = `Extract and suggest 5-8 relevant SEO keywords for the following topic:

Topic: ${topic}
${audienceContext}

Requirements:
- Focus on keywords that people would actually search for
- Include both short-tail (1-2 words) and long-tail (3+ words) keywords
- Consider search intent and commercial value
- Make them specific to the topic and audience
- Include variations and related terms
- Avoid overly competitive single words

Return only the keywords as a comma-separated list, no additional text or explanation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert SEO strategist who identifies high-value keywords for content marketing.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const keywordText = data.choices[0].message.content.trim();
    
    // Split and clean up keywords
    const keywords = keywordText
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0)
      .slice(0, 8); // Limit to 8 keywords

    console.log('Generated keywords:', keywords);

    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-keywords function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
