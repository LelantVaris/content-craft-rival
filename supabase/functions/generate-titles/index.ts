
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
  console.log('=== GENERATE TITLES - PRODUCTION VERSION ===');
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

    const { topic, keywords = [], audience = '', count = 5 } = requestBody;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      console.error('Topic missing or invalid');
      return new Response(JSON.stringify({ 
        error: 'Topic is required and must be a non-empty string' 
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
          p_amount: 2,
          p_tool_used: 'title_generation',
          p_description: `Generated titles for topic: ${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}`
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
    const contextualInfo = [keywordText, audienceText].filter(Boolean).join('\n');
    
    const systemPrompt = `You are an expert content marketing strategist who creates compelling, SEO-optimized article titles. Generate titles that are:
- Engaging and click-worthy
- SEO-friendly with natural keyword integration
- Varied in style (how-to, listicles, guides, questions, etc.)
- Audience-appropriate
- Between 40-60 characters when possible for optimal SEO`;

    const userPrompt = `Create ${count} compelling article titles for the topic: "${topic}"

${contextualInfo}

Requirements:
- Make each title unique and engaging
- Naturally incorporate relevant keywords
- Use different formats (how-to, listicles, guides, questions)
- Keep titles concise but descriptive
- Focus on providing value to the target audience

Return only the titles, one per line, numbered 1-${count}.`;

    console.log('Making OpenAI API call...');
    
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
          max_tokens: 300,
          temperature: 0.8,
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
        error: 'Failed to generate titles. Please try again in a moment.',
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
        error: 'Failed to generate titles. Please try again.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and clean titles
    const titleLines = generatedContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^\d+\.\s*$/))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(title => title.length > 0);

    if (titleLines.length === 0) {
      console.error('No valid titles could be parsed');
      return new Response(JSON.stringify({ 
        error: 'Failed to generate valid titles. Please try again.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const finalTitles = titleLines.slice(0, count);
    console.log(`Successfully generated ${finalTitles.length} titles`);

    return new Response(JSON.stringify({ 
      titles: finalTitles,
      metadata: {
        topic: topic,
        generatedAt: new Date().toISOString(),
        titleCount: finalTitles.length
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
