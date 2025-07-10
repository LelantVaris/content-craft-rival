// supabase/functions/generate/index.ts
import OpenAI from "jsr:@openai/openai";

// Define CORS headers inline since we're in an edge function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, model = "gpt-4", temperature = 0.7 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const stream = await openai.chat.completions.create({
      model,
      temperature,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    });

    // Convert OpenAI stream to Vercel AI SDK format
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async pull(controller) {
        try {
          for await (const part of stream) {
            const content = part.choices[0]?.delta?.content ?? "";
            if (content) {
              // Format as Vercel AI SDK text stream chunk
              controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        // Set content type for Vercel AI SDK
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});