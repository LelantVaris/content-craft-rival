
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== GENERATE TITLES DEBUG VERSION START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Phase 1: Test basic function structure
    console.log('Phase 1: Testing basic function structure...');
    
    // Test environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:');
    console.log('- OpenAI API Key present:', !!openAIApiKey);
    console.log('- Supabase URL present:', !!supabaseUrl);
    console.log('- Service Key present:', !!supabaseServiceKey);
    
    if (!openAIApiKey) {
      console.error('CRITICAL: OPENAI_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        debug: 'OPENAI_API_KEY environment variable missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('CRITICAL: Supabase credentials missing');
      return new Response(JSON.stringify({ 
        error: 'Supabase credentials not configured',
        debug: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test request parsing
    console.log('Phase 2: Testing request parsing...');
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid request body',
        debug: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { topic, keywords = [], audience = '', count = 5 } = requestBody;
    
    if (!topic) {
      console.error('Topic missing from request');
      return new Response(JSON.stringify({ 
        error: 'Topic is required',
        debug: 'No topic provided in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Request parameters:', { topic, keywords, audience, count });

    // Phase 3: Test Supabase connection and credit deduction
    console.log('Phase 3: Testing Supabase connection...');
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log('Supabase client created successfully');
    } catch (supabaseError) {
      console.error('Supabase client creation error:', supabaseError);
      return new Response(JSON.stringify({
        error: 'Supabase connection failed',
        debug: supabaseError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test authentication and credit deduction
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      console.log('Testing authentication and credit deduction...');
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.error('Auth error:', userError);
          return new Response(JSON.stringify({ 
            error: 'Authentication failed',
            debug: userError.message
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (user) {
          console.log('User authenticated:', user.id);
          
          // Test credit deduction
          const { data: creditResult, error: creditError } = await supabase.rpc('deduct_credits', {
            p_user_id: user.id,
            p_amount: 2,
            p_tool_used: 'title_generation',
            p_description: `Generated ${count} titles for: ${topic}`
          });

          console.log('Credit deduction result:', creditResult);
          console.log('Credit deduction error:', creditError);

          if (creditError) {
            console.error('Credit deduction failed:', creditError);
            return new Response(JSON.stringify({ 
              error: 'Credit deduction failed',
              debug: creditError.message
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (!creditResult) {
            console.error('Insufficient credits');
            return new Response(JSON.stringify({ 
              error: 'Insufficient credits',
              debug: 'Credit deduction returned false'
            }), {
              status: 402,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          console.log('Credits deducted successfully');
        }
      } catch (authError) {
        console.error('Authentication/credit error:', authError);
        return new Response(JSON.stringify({
          error: 'Authentication or credit system error',
          debug: authError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Phase 4: Test OpenAI API directly (without AI SDK)
    console.log('Phase 4: Testing OpenAI API directly...');
    
    const keywordText = keywords.length > 0 ? `Keywords to consider: ${keywords.join(', ')}` : '';
    const audienceText = audience ? `Target audience: ${audience}` : '';
    
    const prompt = `Generate ${count} compelling article titles for this topic:

Topic: ${topic}
${keywordText}
${audienceText}

Requirements:
- Make titles engaging and click-worthy
- Include relevant keywords naturally (don't force them)
- Vary the approach (how-to, listicle, guide, strategy, etc.)
- Keep titles between 40-60 characters for SEO
- Make them specific and actionable
- Appeal to the target audience

Generate exactly ${count} titles, one per line:`;

    console.log('Making direct OpenAI API call...');
    console.log('Prompt length:', prompt.length);
    
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
            {
              role: 'system',
              content: 'You are an expert content strategist specializing in creating compelling, SEO-optimized article titles. Generate titles that are click-worthy, SEO-optimized, audience-focused, varied, and professional.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      console.log('OpenAI API response status:', openAIResponse.status);
      console.log('OpenAI API response ok:', openAIResponse.ok);
      
      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error('OpenAI API error response:', errorText);
        return new Response(JSON.stringify({
          error: 'OpenAI API request failed',
          debug: `Status: ${openAIResponse.status}, Response: ${errorText}`
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const openAIData = await openAIResponse.json();
      console.log('OpenAI API response data:', openAIData);
      
      if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
        console.error('Invalid OpenAI response structure:', openAIData);
        return new Response(JSON.stringify({
          error: 'Invalid OpenAI response',
          debug: 'Response missing expected structure'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const generatedText = openAIData.choices[0].message.content;
      console.log('Generated text:', generatedText);
      
      // Parse the generated titles
      const titles = generatedText
        .trim()
        .split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0)
        .slice(0, count);

      console.log('Parsed titles:', titles);

      if (titles.length === 0) {
        console.error('No titles generated');
        return new Response(JSON.stringify({
          error: 'No titles generated',
          debug: 'Generated text could not be parsed into titles'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('=== SUCCESS: All phases completed ===');
      return new Response(JSON.stringify({ 
        titles,
        debug: {
          phase: 'completed',
          titlesGenerated: titles.length,
          method: 'direct_openai_api'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openAIError) {
      console.error('OpenAI API call error:', openAIError);
      return new Response(JSON.stringify({
        error: 'OpenAI API call failed',
        debug: openAIError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Unexpected server error',
      debug: {
        message: error.message,
        type: error.name,
        stack: error.stack?.substring(0, 500) // Limit stack trace length
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
