
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { streamObject } from "npm:ai@4.3.16";
import { openai } from "npm:@ai-sdk/openai@1.3.22";
import { z } from "npm:zod@3.23.8";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema for structured article generation
const ArticleSchema = z.object({
  title: z.string().describe("The main title of the article"),
  sections: z.array(z.object({
    id: z.string().describe("Unique identifier for the section"),
    title: z.string().describe("Section heading"),
    content: z.string().describe("Full content of the section in markdown format"),
    wordCount: z.number().describe("Approximate word count for this section"),
  })).describe("Array of article sections with detailed content"),
  totalWordCount: z.number().describe("Total word count of the entire article"),
  readingTime: z.number().describe("Estimated reading time in minutes"),
  metadata: z.object({
    tone: z.string().describe("Writing tone used"),
    audience: z.string().describe("Target audience"),
    keywords: z.array(z.string()).describe("Keywords incorporated"),
  }).describe("Article metadata"),
});

function buildComprehensivePrompt(params: any): string {
  const {
    title,
    outline,
    keywords = [],
    audience = 'general audience',
    tone = 'professional',
    targetWordCount = 4000,
    pointOfView = 'second',
    brand = '',
    product = '',
    searchIntent = 'informational',
    primaryKeyword = ''
  } = params;

  const outlineText = outline.map((section: any, index: number) => 
    `${index + 1}. ${section.title}\n   Description: ${section.content}`
  ).join('\n');

  const keywordText = keywords.length > 0 ? keywords.join(', ') : '';
  const brandContext = brand ? `Brand: ${brand}` : '';
  const productContext = product ? `Product/Service: ${product}` : '';
  
  const povInstructions = {
    'first': 'Use first-person perspective (I, we, our)',
    'second': 'Use second-person perspective (you, your)',
    'third': 'Use third-person perspective (they, their, one)'
  };

  const intentInstructions = {
    'informational': 'Focus on providing comprehensive, educational information',
    'transactional': 'Include clear calls-to-action and conversion elements',
    'navigational': 'Help users find specific information or navigate topics',
    'commercial': 'Compare options and guide purchase decisions'
  };

  return `You are an expert content writer creating a comprehensive, well-structured article.

CRITICAL REQUIREMENTS:
- Target Word Count: ${targetWordCount} words (THIS IS MANDATORY - do not write shorter articles)
- Writing Perspective: ${povInstructions[pointOfView as keyof typeof povInstructions] || povInstructions.second}
- Tone: ${tone}
- Target Audience: ${audience}
- Search Intent: ${searchIntent} - ${intentInstructions[searchIntent as keyof typeof intentInstructions] || intentInstructions.informational}
${brandContext ? `- ${brandContext}` : ''}
${productContext ? `- ${productContext}` : ''}

ARTICLE SPECIFICATIONS:
Title: ${title}
Primary Keyword: ${primaryKeyword || keywords[0] || ''}
Keywords to Include: ${keywordText}

DETAILED OUTLINE:
${outlineText}

CONTENT REQUIREMENTS:
1. Write EXACTLY ${targetWordCount} words - this is crucial for SEO performance
2. Each section should be substantive with detailed explanations, examples, and insights
3. Use proper markdown formatting (##, ###, **bold**, *italic*, lists, etc.)
4. Include engaging introductions and comprehensive conclusions for each section
5. Incorporate all keywords naturally throughout the content
6. Write in ${tone} tone for ${audience}
7. Use ${povInstructions[pointOfView as keyof typeof povInstructions] || povInstructions.second}
8. Create smooth transitions between sections
9. Include practical examples, case studies, or actionable advice where appropriate
10. Ensure each section contributes meaningfully to the overall article length

${searchIntent === 'transactional' ? 'Include relevant calls-to-action and conversion elements.' : ''}
${brand || product ? `Mention ${brand || product} naturally where relevant, but focus on providing value first.` : ''}

Generate a comprehensive, valuable article that fully addresses the outline and meets the exact word count requirement.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params = await req.json();
    const { 
      title, 
      outline, 
      keywords = [], 
      audience = 'general audience', 
      tone = 'professional',
      targetWordCount = 4000,
      pointOfView = 'second',
      brand = '',
      product = '',
      searchIntent = 'informational',
      primaryKeyword = ''
    } = params;

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Enhanced content generation started:', {
      title,
      targetWordCount,
      sectionsCount: outline.length,
      tone,
      audience,
      pointOfView,
      searchIntent
    });

    // Calculate appropriate maxTokens based on target word count (roughly 4 tokens per word)
    const maxTokens = Math.min(Math.max(targetWordCount * 4, 4000), 16000);
    
    const prompt = buildComprehensivePrompt(params);

    const result = streamObject({
      model: openai('gpt-4o'),
      schema: ArticleSchema,
      prompt,
      temperature: 0.7,
      maxTokens,
    });

    // Create a readable stream for the structured response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          let currentWordCount = 0;
          let sectionsCompleted = 0;
          
          for await (const partialObject of result.partialObjectStream) {
            // Calculate progress
            if (partialObject.sections) {
              const newWordCount = partialObject.sections.reduce((total, section) => {
                return total + (section?.content?.split(' ').length || 0);
              }, 0);
              
              const completeSections = partialObject.sections.filter(s => s?.content && s.content.length > 100).length;
              
              if (newWordCount !== currentWordCount || completeSections !== sectionsCompleted) {
                currentWordCount = newWordCount;
                sectionsCompleted = completeSections;
                
                // Send progress update
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  data: {
                    currentSection: sectionsCompleted,
                    totalSections: outline.length,
                    wordsGenerated: currentWordCount,
                    targetWords: targetWordCount,
                    status: sectionsCompleted < outline.length 
                      ? `Writing section ${sectionsCompleted + 1} of ${outline.length}...`
                      : 'Finalizing article...',
                    progress: Math.min((currentWordCount / targetWordCount) * 100, 95)
                  }
                })}\n\n`));
              }
            }
            
            // Send content update
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'content',
              data: {
                partialContent: partialObject,
                status: 'streaming'
              }
            })}\n\n`));
          }

          // Get final result
          const finalArticle = await result.object;
          
          console.log('Article generation completed:', {
            sectionsGenerated: finalArticle.sections?.length || 0,
            totalWords: finalArticle.totalWordCount || 0,
            targetWords: targetWordCount
          });

          // Send completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            data: {
              article: finalArticle,
              message: `✅ Article complete! Generated ${finalArticle.totalWordCount || 0} words.`,
              progress: 100
            }
          })}\n\n`));

        } catch (error) {
          console.error('Error in enhanced generation:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: { error: error.message }
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in generate-enhanced-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
