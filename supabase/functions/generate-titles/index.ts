
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
      keywords = [], 
      primaryKeyword = '',
      audience = '', 
      searchIntent = 'informational',
      count = 5 
    } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating ${count} PVOD titles for topic: ${topic}`);

    const effectivePrimaryKeyword = primaryKeyword || keywords[0] || '';
    const keywordText = effectivePrimaryKeyword ? `Primary keyword: ${effectivePrimaryKeyword}` : '';
    const secondaryText = keywords.length > 1 ? `Secondary keywords: ${keywords.slice(1).join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';

    // PVOD Title Generation Prompt
    const prompt = `Generate ${count} compelling, PVOD-style article titles for the following topic:

Topic: ${topic}
${keywordText}
${secondaryText}
${audienceText}
Search Intent: ${searchIntent}

PVOD Title Requirements:
- PERSONALITY: Include relatable, human elements
- VALUE: Promise clear benefits or solutions
- OPINION: Hint at expert insights or unique perspectives
- DIRECT: Use conversational, direct language

Title Guidelines:
- 50-60 characters for optimal SEO
- Include power words (Ultimate, Complete, Essential, Proven, etc.)
- Use numbers when appropriate (5 Ways, 10 Tips, etc.)
- Make them click-worthy but accurate
- Vary the style: how-to, lists, guides, questions
- Naturally incorporate the primary keyword
- Address the ${searchIntent} search intent

Examples of PVOD titles:
- "The Complete Guide to [Topic]: What I Learned After [Experience]"
- "Why Most People Get [Topic] Wrong (And How You Can Get It Right)"
- "5 Game-Changing [Topic] Strategies That Actually Work"
- "[Number] [Topic] Mistakes I Made So You Don't Have To"

Return only the titles, one per line, without numbering or bullets.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert copywriter specializing in PVOD content creation. You create titles that are personal, valuable, opinionated, and direct while being SEO-optimized.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();
    
    // Split the response into individual titles and clean them up
    const titles = generatedText
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0)
      .slice(0, count);

    console.log(`Generated ${titles.length} PVOD titles:`, titles);

    return new Response(JSON.stringify({ titles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-titles function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
