
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== GENERATE TITLES DEBUG - STEP 1: BASIC FUNCTION TEST ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Step 1: Testing basic function structure...');
    
    // Test request parsing
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

    const { topic } = requestBody;
    
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

    console.log('Topic received:', topic);

    // Return hardcoded titles for now
    const hardcodedTitles = [
      `How to Master ${topic}: A Complete Guide`,
      `The Ultimate ${topic} Strategy for Beginners`,
      `5 Essential ${topic} Tips You Need to Know`,
      `${topic} Explained: Everything You Should Know`,
      `The Future of ${topic}: Trends and Insights`
    ];

    console.log('=== SUCCESS: Basic function structure works ===');
    return new Response(JSON.stringify({ 
      titles: hardcodedTitles,
      debug: {
        phase: 'step_1_complete',
        method: 'hardcoded_titles',
        topic: topic
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN STEP 1 ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Unexpected server error in step 1',
      debug: {
        message: error.message,
        type: error.name,
        step: 'basic_function_test'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
