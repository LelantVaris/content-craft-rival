
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
    const { 
      title, 
      topic, 
      keywords = [], 
      primaryKeyword = '',
      audience = '',
      searchIntent = 'informational',
      targetWordCount = 4000
    } = await req.json();

    if (!title && !topic) {
      return new Response(JSON.stringify({ error: 'Title or topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const effectivePrimaryKeyword = primaryKeyword || keywords[0] || '';
    const secondaryKeywords = keywords.filter(k => k !== effectivePrimaryKeyword);
    
    const keywordText = effectivePrimaryKeyword ? `Primary keyword: ${effectivePrimaryKeyword}` : '';
    const secondaryText = secondaryKeywords.length > 0 ? `Secondary keywords: ${secondaryKeywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';

    // PVOD Outline Generation Prompt
    const prompt = `Create a detailed PVOD-style article outline for the following:

Title: ${title || topic}
${keywordText}
${secondaryText}
${audienceText}
Search Intent: ${searchIntent}
Target Word Count: ~${targetWordCount} words

PVOD Outline Requirements:
- PERSONALITY: Include sections for personal stories, relatable examples
- VALUE: Ensure each section provides actionable takeaways
- OPINION: Add sections for expert insights and industry perspectives
- DIRECT: Structure content to speak directly to the reader's needs

Outline Structure Guidelines:
- Create 6-8 main sections for comprehensive coverage
- Start with an engaging hook section
- Include a "common mistakes" or "what not to do" section
- Add a "practical tips" or "how-to" section
- Include expert insights or case studies
- End with actionable next steps
- Balance educational content with practical application
- Consider the ${searchIntent} search intent throughout

Section Requirements:
- Each section should have a clear, benefit-focused title
- Include 2-3 sentences describing what the section will cover
- Mention specific takeaways or value points
- Consider keyword integration opportunities
- Flow logically from introduction to conclusion

Format your response as JSON with this structure:
{
  "sections": [
    {
      "title": "Section Title",
      "description": "Brief description of what this section covers and the value it provides"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert content strategist specializing in PVOD content structure. You create outlines that are personal, valuable, opinionated, and direct while being SEO-optimized. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();

    let outline;
    try {
      outline = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', generatedText);
      throw new Error('Failed to parse outline response');
    }

    // Transform the outline into the format expected by the frontend
    const sections = outline.sections.map((section: any, index: number) => ({
      id: (index + 1).toString(),
      title: section.title,
      content: section.description,
      characterCount: section.description.length,
      expanded: false
    }));

    console.log('Generated PVOD outline sections:', sections.length);

    return new Response(JSON.stringify({ sections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
