
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function searchWithFirecrawl(query: string): Promise<string[]> {
  try {
    console.log('Searching with Firecrawl for:', query);
    
    if (!firecrawlApiKey) {
      console.log('Firecrawl API key not available, skipping search');
      return [];
    }
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        pageOptions: {
          onlyMainContent: true,
          includeHtml: false,
          waitFor: 1000,
        },
        limit: 2,
      }),
    });

    if (!searchResponse.ok) {
      console.error('Firecrawl search failed:', searchResponse.statusText);
      return [];
    }

    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    
    const content = results.map((result: any) => {
      const text = result.content || result.markdown || '';
      return text.substring(0, 1500);
    }).filter(Boolean);

    console.log(`Found ${content.length} search results for query: ${query}`);
    return content;
  } catch (error) {
    console.error('Error searching with Firecrawl:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, outline, keywords = [], audience = '', tone = 'professional' } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!title || !outline || outline.length === 0) {
      return new Response(JSON.stringify({ error: 'Title and outline are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting enhanced article generation for:', title);

    // Create outline text
    const outlineText = outline.map((section: any, index: number) => 
      `${index + 1}. ${section.title}\n   - ${section.content}`
    ).join('\n');

    // Research key topics for the article
    const researchQueries = [
      `${title} latest trends 2024`,
      `${keywords.slice(0, 3).join(' ')} best practices`,
      `${title} statistics and data`
    ];

    let researchData = '';
    for (const query of researchQueries) {
      const results = await searchWithFirecrawl(query);
      if (results.length > 0) {
        researchData += `\n\nResearch for "${query}":\n${results.join('\n')}\n`;
      }
    }

    // Generate the article using OpenAI
    const prompt = `You are an expert content writer creating comprehensive, research-enhanced articles.

Write in a ${tone} tone for this audience: ${audience || 'general audience'}.

Title: ${title}

Outline to follow:
${outlineText}

Target keywords to include naturally: ${keywords.join(', ')}

${researchData ? `Current research data to incorporate:${researchData}` : ''}

Instructions:
1. Create a well-structured article based on the provided outline
2. Use proper markdown formatting with headers, subheaders, and lists
3. Include relevant statistics, examples, and insights from the research data
4. Integrate the target keywords naturally throughout the content
5. Write engaging, informative content that provides real value
6. Aim for comprehensive coverage of each section in the outline

Write the complete article now:`;

    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert content writer specializing in creating comprehensive, SEO-optimized articles. Write in ${tone} tone.` 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Article generation completed successfully');

    return new Response(JSON.stringify({ 
      generatedText,
      researchUsed: researchData.length > 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-enhanced-article function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
