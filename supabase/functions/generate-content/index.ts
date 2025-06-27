
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
    const { title, outline, keywords = [], audience = '', writingStyle = 'professional', tone = 'informative' } = await req.json();

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keywordText = keywords.length > 0 ? `Target keywords: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';

    // Create outline text for the prompt
    const outlineText = outline.map((section: any, index: number) => 
      `${index + 1}. ${section.title}\n   - ${section.content}`
    ).join('\n');

    const prompt = `Write a comprehensive, engaging article based on the following specifications:

Title: ${title}
Writing Style: ${writingStyle}
Tone: ${tone}
${keywordText}
${audienceText}

Outline:
${outlineText}

Requirements:
- Write a full article with detailed content for each section
- Use markdown formatting (headers, bold, italic, lists, etc.)
- Make it SEO-optimized and engaging
- Include practical examples and actionable advice
- Aim for 1500-2500 words total
- Use proper heading structure (# ## ###)
- Include a compelling introduction and strong conclusion
- Write in a ${tone} tone with ${writingStyle} style
- Incorporate the target keywords naturally throughout the content

Start with the title as an H1 heading, then write the full article with proper structure and formatting.`;

    console.log('Generating content with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert content writer who creates comprehensive, SEO-optimized articles that engage readers and provide real value. You always use proper markdown formatting and structure.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content.trim();

    console.log('Generated content length:', generatedContent.length);

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
