
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { prompt, option, command } = await req.json();
    
    console.log('AI completion request:', { option, command, promptLength: prompt?.length });

    let systemPrompt = '';
    let userPrompt = prompt;

    // Handle different AI options
    switch (option) {
      case 'improve':
        systemPrompt = 'You are an expert writing assistant. Improve the following text by making it clearer, more engaging, and better written while maintaining the original meaning and tone.';
        break;
      case 'fix':
        systemPrompt = 'You are a grammar and spelling expert. Fix any grammar, spelling, or punctuation errors in the following text while maintaining the original meaning and style.';
        break;
      case 'shorter':
        systemPrompt = 'You are an expert editor. Make the following text more concise and shorter while preserving all important information and meaning.';
        break;
      case 'longer':
        systemPrompt = 'You are an expert writer. Expand the following text by adding more detail, examples, or explanations while maintaining the original tone and style.';
        break;
      case 'continue':
        systemPrompt = 'You are a creative writing assistant. Continue the following text in a natural way that flows seamlessly from the existing content. Match the tone and style.';
        break;
      case 'zap':
        systemPrompt = `You are a helpful writing assistant. Follow this instruction: "${command}". Apply it to the following text:`;
        break;
      default:
        systemPrompt = 'You are a helpful writing assistant. Improve the following text based on the context provided.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('AI completion successful:', { generatedLength: generatedText?.length });

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-completion function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
