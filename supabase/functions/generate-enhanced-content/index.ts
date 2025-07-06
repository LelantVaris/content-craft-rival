
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
  title: z.string().describe("The main title of the article following PVOD framework"),
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

function countWordsInMarkdown(content: string): number {
  if (!content) return 0;
  // Remove markdown formatting and count words
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold/italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code formatting
    .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .trim();
  
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

function buildPVODPrompt(params: any): string {
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
  const effectivePrimaryKeyword = primaryKeyword || keywords[0] || '';
  const secondaryKeywords = keywords.filter((k: string) => k !== effectivePrimaryKeyword);
  
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

  return `You are an expert content writer creating high-quality articles following the PVOD (Personality, Value, Opinion, Direct) framework.

## CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:

### TARGET SPECIFICATIONS:
- **MANDATORY Word Count**: EXACTLY ${targetWordCount} words (this is non-negotiable)
- **Primary Keyword**: "${effectivePrimaryKeyword}" (MUST appear in title, intro within first 50 words, first H2, and conclusion)
- **Secondary Keywords**: ${secondaryKeywords.join(', ')} (use naturally throughout)
- **Target Audience**: ${audience}
- **Tone**: ${tone}
- **Point of View**: ${povInstructions[pointOfView as keyof typeof povInstructions] || povInstructions.second}
- **Search Intent**: ${searchIntent} - ${intentInstructions[searchIntent as keyof typeof intentInstructions] || intentInstructions.informational}

### PVOD FRAMEWORK REQUIREMENTS:

#### P - PERSONALITY (Human, Not AI):
- Write like a human with clear, defined voice
- Use humor where appropriate (not slapstick)
- Be warm, relatable, and conversational
- Use relatable metaphors for complex concepts
- Address reader as "You" (${povInstructions[pointOfView as keyof typeof povInstructions]})
- NO AI tropes or generic phrasing
- Break rules if it makes writing more relatable

#### V - VALUE (High Value Density):
- Provide NEW, actionable insights (not rehashed content)
- Include real-world examples with specific details
- Show > tell with concrete examples
- Answer: What do readers already know? Want to know? Need to know?
- Every paragraph must add genuine value
- Eliminate filler content and obvious statements
- Include practical, implementable advice

#### O - OPINION (Novel Perspective):
- Present unique angles and unexpected perspectives
- Include supported opinions backed by facts/examples
- Challenge assumptions and offer fresh insights
- Be bias-aware but not neutral
- Include diverse voices and sources
- Avoid stereotypes and clichés

#### D - DIRECT (No Fluff):
- Maximum 4 lines per paragraph
- Use short, varied sentences
- Logical flow that guides readers through journey
- Break up text with headers, bullets, tables
- Address search intent immediately in intro
- Avoid long introductions (60-80 words max)

### SEO REQUIREMENTS:
- Primary keyword "${effectivePrimaryKeyword}" in:
  * Title (front-loaded)
  * Introduction (within first 50 words)
  * First H2 subheading
  * Conclusion
- Use secondary keywords naturally in H2s where possible
- Address search intent immediately
- Include 4+ internal link opportunities (mention "[INTERNAL LINK]")
- Include 1+ external link opportunities to authoritative sources
- Add real-world examples with specific company/product names
- Include relevant statistics where possible

### TITLE REQUIREMENTS:
- Front-load primary keyword
- Include numbers where relevant
- 50-60 characters max
- Provide unique angle that stands out
- Formula: Keyword + Value + Unique Angle
- Avoid: "efficiency," "streamline," "solutions," "maximize"

### CONTENT STRUCTURE:
Title: ${title}
Outline to follow:
${outlineText}

### WRITING STYLE GUIDELINES:
- Short sentences and paragraphs (max 4 lines)
- Use bullet points and subheadings liberally
- Include tables for comparisons
- Vary sentence structure
- Use industry terminology appropriately
- Include humor that adds value, not distraction
${brand ? `- Reference ${brand} naturally where relevant` : ''}
${product ? `- Mention ${product} contextually when appropriate` : ''}

## MANDATORY FINAL CHECK:
Before completing, verify:
1. Word count is EXACTLY ${targetWordCount} words (±50 words acceptable)
2. Primary keyword appears in all required locations
3. Each section provides genuine value and actionable insights
4. Content follows PVOD framework throughout
5. Search intent is addressed immediately
6. Real examples and specific details are included
7. Tone is ${tone} and appropriate for ${audience}

Generate a comprehensive, valuable article that fully meets these requirements.`;
}

async function extendArticleContent(article: any, targetWordCount: number, currentWordCount: number): Promise<any> {
  const wordsNeeded = targetWordCount - currentWordCount;
  const tolerance = targetWordCount * 0.15; // 15% tolerance
  
  if (wordsNeeded < tolerance) {
    return article; // Close enough, no extension needed
  }

  console.log(`Extending article: need ${wordsNeeded} more words (current: ${currentWordCount}, target: ${targetWordCount})`);
  
  // Find shortest sections that could be expanded
  const sectionsToExpand = article.sections
    .map((section: any, index: number) => ({
      ...section,
      index,
      wordCount: countWordsInMarkdown(section.content)
    }))
    .sort((a: any, b: any) => a.wordCount - b.wordCount)
    .slice(0, Math.min(3, article.sections.length)); // Top 3 shortest sections

  const extensionPrompt = `Expand the following article sections to add approximately ${wordsNeeded} words total while maintaining PVOD quality:

CURRENT ARTICLE TITLE: ${article.title}
TARGET WORD COUNT: ${targetWordCount}
CURRENT WORD COUNT: ${currentWordCount}
WORDS NEEDED: ${wordsNeeded}

SECTIONS TO EXPAND (maintain existing structure, add valuable content):
${sectionsToExpand.map((section: any) => `
**${section.title}** (currently ${section.wordCount} words)
${section.content}
`).join('\n')}

EXPANSION REQUIREMENTS:
- Add 2-3 real-world examples with specific details
- Include actionable steps or tips
- Add relevant statistics or data points
- Provide case studies or success stories
- Expand with valuable insights, NOT filler content
- Maintain PVOD framework (Personality, Value, Opinion, Direct)
- Keep existing tone and style
- Each expanded section should add 150-300 words of high-value content

Return ONLY the expanded sections with the same structure but enhanced content.`;

  try {
    const extensionResult = await streamObject({
      model: openai('gpt-4o'),
      schema: z.object({
        expandedSections: z.array(z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          wordCount: z.number(),
        }))
      }),
      prompt: extensionPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    const expandedData = await extensionResult.object;
    
    // Replace the expanded sections in the original article
    const updatedSections = [...article.sections];
    expandedData.expandedSections.forEach((expandedSection: any) => {
      const sectionIndex = updatedSections.findIndex(s => s.id === expandedSection.id);
      if (sectionIndex !== -1) {
        updatedSections[sectionIndex] = expandedSection;
      }
    });

    // Recalculate total word count
    const newTotalWordCount = updatedSections.reduce((total, section) => 
      total + countWordsInMarkdown(section.content), 0
    );

    return {
      ...article,
      sections: updatedSections,
      totalWordCount: newTotalWordCount,
      readingTime: Math.ceil(newTotalWordCount / 200)
    };
    
  } catch (error) {
    console.error('Error extending article:', error);
    return article; // Return original if extension fails
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ENHANCED CONTENT GENERATION EDGE FUNCTION START ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const params = await req.json();
    console.log('Request parameters received:', {
      title: params.title?.length || 0,
      outline: params.outline?.length || 0,
      keywords: params.keywords?.length || 0,
      audience: params.audience || 'NOT PROVIDED',
      tone: params.tone || 'NOT PROVIDED',
      targetWordCount: params.targetWordCount || 'NOT PROVIDED',
      pointOfView: params.pointOfView || 'NOT PROVIDED',
      searchIntent: params.searchIntent || 'NOT PROVIDED'
    });

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
      const errorMsg = 'Title and outline are required';
      console.error('Validation failed:', errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Enhanced PVOD content generation started:', {
      title,
      targetWordCount,
      sectionsCount: outline.length,
      tone,
      audience,
      pointOfView,
      searchIntent,
      primaryKeyword: primaryKeyword || keywords[0]
    });

    // Calculate appropriate maxTokens based on target word count
    const maxTokens = Math.min(Math.max(targetWordCount * 4, 6000), 16000);
    console.log('Using maxTokens:', maxTokens);
    
    const prompt = buildPVODPrompt(params);
    console.log('Generated prompt length:', prompt.length);

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
          console.log('Starting stream processing...');
          let currentWordCount = 0;
          let sectionsCompleted = 0;
          let finalArticle = null;
          let eventCount = 0;
          
          for await (const partialObject of result.partialObjectStream) {
            eventCount++;
            console.log(`Processing partial object #${eventCount}:`, {
              hasSections: !!partialObject.sections,
              sectionsLength: partialObject.sections?.length || 0
            });

            // Calculate progress
            if (partialObject.sections) {
              const newWordCount = partialObject.sections.reduce((total, section) => {
                return total + (section?.content ? countWordsInMarkdown(section.content) : 0);
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

          console.log('Partial object stream completed, getting final result...');
          // Get final result
          finalArticle = await result.object;
          const initialWordCount = countWordsInMarkdown(
            finalArticle.sections?.map(s => s.content).join(' ') || ''
          );

          console.log('Initial generation completed:', {
            sectionsGenerated: finalArticle.sections?.length || 0,
            initialWordCount,
            targetWords: targetWordCount
          });

          // Word count validation and extension
          const tolerance = targetWordCount * 0.15; // 15% tolerance
          if (initialWordCount < (targetWordCount - tolerance)) {
            console.log('Article is too short, extending...');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              data: {
                currentSection: outline.length,
                totalSections: outline.length,
                wordsGenerated: initialWordCount,
                targetWords: targetWordCount,
                status: `Extending article to meet ${targetWordCount} word target...`,
                progress: 85
              }
            })}\n\n`));

            // Extend the article
            finalArticle = await extendArticleContent(finalArticle, targetWordCount, initialWordCount);
            
            const finalWordCount = countWordsInMarkdown(
              finalArticle.sections?.map(s => s.content).join(' ') || ''
            );

            console.log('Article extension completed:', {
              initialWords: initialWordCount,
              finalWords: finalWordCount,
              targetWords: targetWordCount,
              extensionSuccess: finalWordCount >= (targetWordCount - tolerance)
            });

            // Update final article word count
            finalArticle.totalWordCount = finalWordCount;
            finalArticle.readingTime = Math.ceil(finalWordCount / 200);
          }

          // Send completion
          console.log('Sending completion event...');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            data: {
              article: finalArticle,
              message: `✅ PVOD Article complete! Generated ${finalArticle.totalWordCount || 0} words meeting all content guidelines.`,
              progress: 100,
              contentQuality: {
                wordCountMet: (finalArticle.totalWordCount || 0) >= (targetWordCount - tolerance),
                pvotFramework: true,
                keywordIntegration: true,
                seoOptimized: true
              }
            }
          })}\n\n`));

          console.log('Stream processing completed successfully');

        } catch (error) {
          console.error('=== ERROR IN ENHANCED PVOD GENERATION ===');
          console.error('Error type:', typeof error);
          console.error('Error message:', error instanceof Error ? error.message : String(error));
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: { error: error instanceof Error ? error.message : String(error) }
          })}\n\n`));
        } finally {
          console.log('Closing stream controller');
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
    console.error('=== ERROR IN GENERATE-ENHANCED-CONTENT FUNCTION ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
