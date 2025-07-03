import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase@1.2.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== GENERATE OUTLINE - PRODUCTION VERSION ===');
  console.log('Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate OpenAI API key
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request received:', { 
        title: requestBody.title,
        topic: requestBody.topic,
        keywordCount: requestBody.keywords?.length || 0,
        audience: !!requestBody.audience 
      });
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid request format. Please check your request body.'
      }), {
        status: 400,
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
    } = requestBody;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      console.error('Title missing or invalid');
      return new Response(JSON.stringify({ 
        error: 'Title is required and must be a non-empty string' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits first (if user is authenticated)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        console.log('Deducting credits for user:', user.id);
        const { data: creditResult } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: 3,
          p_tool_used: 'outline_generation',
          p_description: `Generated outline for: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`
        });

        if (!creditResult) {
          console.error('Insufficient credits for user:', user.id);
          return new Response(JSON.stringify({ 
            error: 'Insufficient credits. Please upgrade your plan or purchase more credits.' 
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log('Credits deducted successfully');
      }
    }

    // Build enhanced prompt
    const keywordText = keywords.length > 0 ? `Focus keywords: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';
    const topicText = topic ? `Original topic: ${topic}` : '';
    const contextualInfo = [topicText, keywordText, audienceText].filter(Boolean).join('\n');
    
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
${contextualInfo}
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

    console.log('Making OpenAI API call for outline generation...');
    
    // Make API call with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let openAIResponse;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    console.log('OpenAI API response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        error: errorText
      });
      
      return new Response(JSON.stringify({ 
        error: 'Failed to generate outline. Please try again in a moment.',
        details: openAIResponse.status === 429 ? 'Rate limit exceeded' : 'Service temporarily unavailable'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      console.error('No content generated by OpenAI');
      return new Response(JSON.stringify({ 
        error: 'Failed to generate outline. Please try again.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the generated outline
    let sections;
    try {
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        sections = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse outline JSON:', parseError);
      console.error('Generated content:', generatedContent);
      
      // Fallback to sample outline on parsing error
      sections = [
        {
          id: 'section-1',
          title: 'Introduction',
          content: 'Hook readers with a compelling opening that highlights the importance of the topic.',
          characterCount: 600,
          expanded: false
        },
        {
          id: 'section-2',
          title: 'Understanding the Fundamentals',
          content: 'Define key concepts and explain core principles that readers need to know.',
          characterCount: 800,
          expanded: false
        },
        {
          id: 'section-3',
          title: 'Step-by-Step Implementation',
          content: 'Detailed guide on how to implement the strategies discussed in the article.',
          characterCount: 1000,
          expanded: false
        },
        {
          id: 'section-4',
          title: 'Best Practices and Tips',
          content: 'Expert advice and proven techniques for getting the best results.',
          characterCount: 800,
          expanded: false
        },
        {
          id: 'section-5',
          title: 'Common Mistakes to Avoid',
          content: 'Highlight pitfalls and challenges that readers should be aware of.',
          characterCount: 600,
          expanded: false
        },
        {
          id: 'section-6',
          title: 'Conclusion and Next Steps',
          content: 'Summarize key takeaways and provide actionable next steps for readers.',
          characterCount: 400,
          expanded: false
        }
      ];
    }

    // Validate and ensure proper structure
    if (!Array.isArray(sections) || sections.length === 0) {
      console.error('Invalid outline structure generated');
      // Use fallback outline
      sections = [
        {
          id: 'section-1',
          title: 'Introduction',
          content: 'Hook readers with a compelling opening that highlights the importance of the topic.',
          characterCount: 600,
          expanded: false
        },
        {
          id: 'section-2',
          title: 'Main Content',
          content: 'Core content that addresses the main topic and provides value to readers.',
          characterCount: 2000,
          expanded: false
        },
        {
          id: 'section-3',
          title: 'Conclusion',
          content: 'Summarize key takeaways and provide actionable next steps for readers.',
          characterCount: 400,
          expanded: false
        }
      ];
    }

    // Ensure each section has required properties
    sections = sections.map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      title: section.title || `Section ${index + 1}`,
      content: section.content || 'Content description',
      characterCount: section.characterCount || Math.floor(targetWordCount / sections.length * 5), // ~5 chars per word
      expanded: false
    }));

    console.log(`Successfully generated outline with ${sections.length} sections`);

    return new Response(JSON.stringify({ 
      sections,
      metadata: {
        title: title,
        generatedAt: new Date().toISOString(),
        sectionCount: sections.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ 
        error: 'Request timed out. Please try again.' 
      }), {
        status: 408,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
