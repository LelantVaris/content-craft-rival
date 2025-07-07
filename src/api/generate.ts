
import { supabase } from "@/integrations/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, option, command } = body;

    // Use Supabase Edge Function instead of direct API call
    const { data, error } = await supabase.functions.invoke('generate-ai-completion', {
      body: { prompt, option, command }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return new Response(data.generatedText, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('API generate error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
