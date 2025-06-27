
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
    const { topic, keywords = [], audience = '', count = 5 } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating ${count} titles for topic: ${topic}`);

    const keywordText = keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';

    const prompt = `Generate ${count} compelling, SEO-optimized article titles for the following topic:

Topic: ${topic}
${keywordText}
${audienceText}

Requirements:
- Each title should be 50-60 characters for optimal SEO
- Include power words and numbers where appropriate
- Make them engaging and click-worthy
- Ensure they accurately represent the topic
- Vary the style (how-to, list, guide, etc.)

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
          { role: 'system', content: 'You are an expert SEO copywriter who creates compelling article titles that drive clicks and rank well in search engines.' },
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
      .slice(0, count); // Use the actual count parameter instead of hardcoded 5

    console.log(`Generated ${titles.length} titles:`, titles);

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
