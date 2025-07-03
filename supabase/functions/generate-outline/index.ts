
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
      title, 
      topic, 
      keywords = [], 
      audience = '',
      tone = 'professional',
      targetWordCount = 4000
    } = await req.json();

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
          p_amount: 3,
          p_tool_used: 'outline_generation',
          p_description: `Generated outline for: ${title}`
        });

        if (!creditResult) {
          return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Build context for outline generation
    const keywordText = keywords.length > 0 ? `Keywords to integrate: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';
    const topicText = topic ? `Original topic: ${topic}` : '';
    
    const systemPrompt = `You are an expert content strategist who creates comprehensive, engaging article outlines. Create outlines that:

1. **Logical Flow**: Natural progression from introduction to conclusion
2. **Comprehensive Coverage**: Cover all important aspects of the topic
3. **Engaging Structure**: Mix of different content types (how-to, examples, tips, etc.)
4. **SEO-Optimized**: Naturally incorporate keywords
5. **Audience-Focused**: Tailored to the target audience's needs and knowledge level

Return the outline as a JSON array of sections, each with:
- id: unique identifier
- title: section heading
- content: brief description of what this section will cover
- characterCount: estimated character count for this section
- expanded: boolean (always false for new outlines)`;

    const userPrompt = `Create a comprehensive article outline for:

Title: "${title}"
${topicText}
${keywordText}
${audienceText}
Tone: ${tone}
Target word count: ~${targetWordCount} words

Requirements:
- Create 6-8 main sections (including introduction and conclusion)
- Each section should have a clear purpose and unique angle
- Naturally incorporate the keywords throughout different sections
- Ensure logical flow and progression
- Make it comprehensive but not overwhelming
- Include actionable insights and practical value
- Tailor content depth to the target audience

Return as JSON array with this exact structure:
[
  {
    "id": "section-1",
    "title": "Introduction: [Engaging Hook Title]",
    "content": "Brief description of what this introduction will cover",
    "characterCount": 800,
    "expanded": false
  }
]

Generate the complete JSON array:`;

    console.log('Starting AI SDK outline generation for:', title);

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Parse the generated outline
    let sections;
    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        sections = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse outline JSON:', parseError);
      throw new Error('Failed to parse generated outline');
    }

    // Validate and ensure proper structure
    if (!Array.isArray(sections) || sections.length === 0) {
      throw new Error('Invalid outline structure generated');
    }

    // Ensure each section has required properties
    sections = sections.map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      title: section.title || `Section ${index + 1}`,
      content: section.content || 'Content description',
      characterCount: section.characterCount || Math.floor(targetWordCount / sections.length * 5), // ~5 chars per word
      expanded: false
    }));

    console.log('Generated outline sections:', sections.length);

    return new Response(JSON.stringify({ sections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Outline generation failed',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
