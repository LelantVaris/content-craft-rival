
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { title, outline, keywords = [], audience = '', tone = 'professional' } = await req.json();

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

    const keywordText = keywords.length > 0 ? `Target keywords: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';
    
    let outlineText = '';
    if (outline && outline.length > 0) {
      outlineText = outline.map((section: any, index: number) => 
        `${index + 1}. ${section.title}\n   - ${section.content}`
      ).join('\n');
    }

    const prompt = `Write a comprehensive, engaging article based on the following specifications:

Title: ${title}
${keywordText}
${audienceText}
Tone: ${tone}

${outlineText ? `Outline:\n${outlineText}\n` : ''}

Requirements:
- Write a full article with detailed content
- Use markdown formatting (headers, bold, italic, lists, etc.)
- Make it SEO-optimized and engaging
- Include practical examples and actionable advice
- Aim for 1200-2000 words total
- Use proper heading structure (# ## ###)
- Start with the title as an H1 heading
- Create valuable, informative content that serves the target audience`;

    console.log('Starting content generation for:', title);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert content writer who creates comprehensive, SEO-optimized articles. Always use proper markdown formatting and structure.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Generate meta description
    const metaDescription = `${title} - ${content.substring(0, 150).replace(/[#*]/g, '').trim()}...`;

    console.log('Content generated successfully, length:', content.length);

    return new Response(JSON.stringify({ 
      content,
      metaDescription,
      wordCount: content.split(' ').length,
      readingTime: Math.ceil(content.split(' ').length / 200)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Content generation failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
