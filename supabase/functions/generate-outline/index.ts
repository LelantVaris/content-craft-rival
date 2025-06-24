
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
    const { title, topic, keywords = [], audience = '' } = await req.json();

    if (!title && !topic) {
      return new Response(JSON.stringify({ error: 'Title or topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keywordText = keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';

    const prompt = `Create a detailed article outline for the following:

Title: ${title || topic}
${keywordText}
${audienceText}

Requirements:
- Create 5-8 main sections
- Each section should have a clear, descriptive title
- Include a brief description (1-2 sentences) of what each section will cover
- Structure should flow logically from introduction to conclusion
- Make it comprehensive and SEO-friendly
- Include an introduction and conclusion section

Format your response as JSON with this structure:
{
  "sections": [
    {
      "title": "Section Title",
      "description": "Brief description of what this section covers"
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
          { role: 'system', content: 'You are an expert content strategist who creates well-structured article outlines that engage readers and perform well in search engines. Always respond with valid JSON.' },
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

    console.log('Generated outline sections:', sections.length);

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
