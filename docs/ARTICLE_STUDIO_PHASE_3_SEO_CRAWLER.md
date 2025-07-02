
# Article Studio Phase 3: SEO Pro Mode & Crawler Integration

## Overview
**Priority**: MEDIUM - Requires Phases 1-2 completion  
**Status**: 🔴 Not Started  
**Estimated Time**: 6-8 hours  
**Dependencies**: Phases 1-2 complete, Multi-website architecture (Phase 4)

## SEO Pro Mode Redesign

### Current Problem
SEO Pro Mode currently only reveals keywords section, but the real value should be **internal link suggestions** based on crawled website data.

### New SEO Pro Mode Functionality

#### What SEO Pro Mode Should Do
1. **Internal Link Suggestions**: Analyze crawled website pages to suggest relevant internal links
2. **Content Gap Analysis**: Identify topics covered by existing pages
3. **Keyword Optimization**: Suggest keywords based on existing high-performing pages
4. **Content Strategy**: Recommend content angles based on site structure

#### What Keywords Section Should Do (Always Visible)
- Basic keyword input and AI generation
- Primary/secondary keyword designation
- Keyword difficulty estimation (if API available)

## Technical Architecture

### Data Flow
```
User Article Topic 
    ↓
Crawler Data Query (for active website)
    ↓
Page Content Analysis
    ↓  
Internal Link Suggestions
    ↓
Enhanced Content Generation
```

### Required Database Schema

#### Website Crawler Data Structure
```sql
-- Crawler results are already stored, need to query effectively
SELECT 
  url,
  title,
  meta_description,
  content_summary,
  internal_links,
  keywords_found
FROM website_crawl_results 
WHERE website_id = $1
  AND status = 'completed'
  AND content_type = 'page'
ORDER BY last_crawled DESC;
```

#### Enhanced Article Generation Context
```typescript
interface SEOContext {
  websiteId: string;
  crawledPages: CrawledPage[];
  internalLinkSuggestions: InternalLink[];
  contentGaps: ContentGap[];
  existingKeywords: string[];
}

interface InternalLink {
  url: string;
  title: string;
  relevanceScore: number;
  anchorTextSuggestion: string;
  contextMatch: string;
}
```

## Implementation Plan

### Step 1: Crawler Data Analysis Service

#### Internal Link Suggestion Algorithm
**File**: `src/utils/seoAnalysis.ts`

```typescript
export class SEOAnalyzer {
  static async findRelevantInternalLinks(
    articleTopic: string,
    keywords: string[],
    crawledPages: CrawledPage[]
  ): Promise<InternalLink[]> {
    const suggestions: InternalLink[] = [];
    
    for (const page of crawledPages) {
      const relevanceScore = this.calculateRelevance(
        articleTopic,
        keywords,
        page.content_summary || page.title
      );
      
      if (relevanceScore > 0.6) {
        suggestions.push({
          url: page.url,
          title: page.title,
          relevanceScore,
          anchorTextSuggestion: this.generateAnchorText(page.title, keywords),
          contextMatch: this.findContextMatch(articleTopic, page.content_summary)
        });
      }
    }
    
    return suggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Top 10 suggestions
  }
  
  private static calculateRelevance(
    topic: string,
    keywords: string[],
    pageContent: string
  ): number {
    // Implementation: TF-IDF similarity or simple keyword matching
    // Return score between 0-1
  }
  
  private static generateAnchorText(
    pageTitle: string,
    keywords: string[]
  ): string {
    // Generate SEO-friendly anchor text suggestions
  }
}
```

### Step 2: Enhanced Edge Functions with SEO Context

#### SEO-Enhanced Content Generation
**File**: `supabase/functions/generate-content-with-seo/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      title,
      outline,
      keywords,
      tone,
      length,
      audience,
      brand,
      product,
      websiteId,
      seoProMode = false
    } = await req.json();

    let seoContext = null;
    
    if (seoProMode && websiteId) {
      // Get crawler data for the website
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data: crawledPages } = await supabase
        .from('website_crawl_results')
        .select('url, title, meta_description, content_summary')
        .eq('website_id', websiteId)
        .eq('status', 'completed')
        .limit(50);
      
      if (crawledPages?.length) {
        seoContext = {
          internalLinkSuggestions: await findRelevantInternalLinks(
            title,
            keywords,
            crawledPages
          ),
          existingContent: crawledPages.map(p => ({
            title: p.title,
            url: p.url,
            summary: p.content_summary
          }))
        };
      }
    }

    // Enhanced prompt with SEO context
    const enhancedPrompt = `
Write a comprehensive article: "${title}"

${/* ... existing prompt specifications ... */}

${seoContext ? `
SEO OPTIMIZATION REQUIREMENTS:
- Include 3-5 internal links from these suggestions:
${seoContext.internalLinkSuggestions.map(link => 
  `  • "${link.title}" (${link.url}) - ${link.anchorTextSuggestion}`
).join('\n')}

- Ensure content complements existing site content:
${seoContext.existingContent.slice(0, 5).map(content => 
  `  • ${content.title} - ${content.summary?.substring(0, 100)}...`
).join('\n')}

- Internal links should be naturally integrated into the content
- Use suggested anchor text when appropriate
- Maintain content uniqueness while building on site's content strategy
` : ''}

Return the complete article in Markdown format with internal links properly formatted.
    `;

    // Call OpenAI with enhanced prompt
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert SEO content writer.' },
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const result = await openAIResponse.json();
    const content = result.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        content,
        seoAnalysis: seoContext ? {
          internalLinksIncluded: seoContext.internalLinkSuggestions.length,
          contentGapsCovered: seoContext.existingContent.length
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in SEO content generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

### Step 3: Enhanced SEO Pro Mode UI

#### SEO Pro Mode Panel
**File**: `src/components/ArticleStudio/SEOProModePanel.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Link } from 'lucide-react';

interface SEOProModePanelProps {
  websiteId: string;
  articleTopic: string;
  keywords: string[];
  isEnabled: boolean;
}

export const SEOProModePanel: React.FC<SEOProModePanelProps> = ({
  websiteId,
  articleTopic,
  keywords,
  isEnabled
}) => {
  const [internalLinks, setInternalLinks] = useState<InternalLink[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isEnabled && websiteId && articleTopic) {
      analyzeSEOOpportunities();
    }
  }, [isEnabled, websiteId, articleTopic, keywords]);

  const analyzeSEOOpportunities = async () => {
    setIsAnalyzing(true);
    try {
      const { data } = await supabase.functions.invoke('analyze-seo-opportunities', {
        body: {
          websiteId,
          topic: articleTopic,
          keywords
        }
      });
      
      setInternalLinks(data.internalLinks || []);
      setContentGaps(data.contentGaps || []);
    } catch (error) {
      console.error('SEO analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Internal Link Suggestions */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Internal Link Opportunities
            </h4>
            <div className="space-y-2">
              {internalLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{link.title}</p>
                    <p className="text-xs text-gray-600">{link.anchorTextSuggestion}</p>
                    <p className="text-xs text-gray-500">{link.url}</p>
                  </div>
                  <Badge variant="secondary">
                    {Math.round(link.relevanceScore * 100)}% match
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Content Strategy Insights */}
          <div>
            <h4 className="font-semibold mb-3">Content Strategy</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {internalLinks.length} Link Opportunities
                </p>
                <p className="text-xs text-blue-700">
                  Pages that complement this article
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">  
                <p className="text-sm font-medium text-green-900">
                  {contentGaps.length} Content Gaps
                </p>
                <p className="text-xs text-green-700">
                  Topics not yet covered on site
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### Integration with ContentBriefForm
**File**: `src/components/ArticleStudio/ContentBriefForm.tsx`

```typescript
// Add SEO Pro Mode panel after advanced customizations
{seoProMode && (
  <SEOProModePanel
    websiteId={currentWebsite?.id}
    articleTopic={articleData.topic}
    keywords={articleData.keywords}
    isEnabled={seoProMode}
  />
)}
```

## Testing & Validation

### SEO Analysis Tests
- [ ] Internal link suggestions are relevant (>70% relevance score)
- [ ] Content gaps identified accurately
- [ ] SEO analysis updates when topic/keywords change
- [ ] Analysis works with different website sizes

### Content Generation Tests
- [ ] Internal links naturally integrated into content
- [ ] Anchor text suggestions used appropriately
- [ ] Content maintains uniqueness while complementing existing pages
- [ ] SEO-enhanced content performs better than basic generation

### Performance Tests
- [ ] SEO analysis completes within 5 seconds
- [ ] Large website crawls don't timeout
- [ ] UI remains responsive during analysis
- [ ] Proper error handling for failed analyses

## Success Metrics

### SEO Effectiveness
- **Internal Link Integration**: 90%+ of suggested links naturally included
- **Content Uniqueness**: <20% similarity to existing site content
- **SEO Score Improvement**: 25%+ higher SEO scores with Pro Mode
- **User Adoption**: 70%+ of users enable SEO Pro Mode

### Technical Performance
- **Analysis Speed**: <5 seconds for sites with <500 pages
- **Accuracy**: 80%+ of internal link suggestions rated as relevant
- **Error Rate**: <2% failed SEO analyses
- **Crawler Integration**: 100% compatibility with existing crawler data

## Dependencies

### Required for Phase 3
- ✅ Phases 1-2 complete and functional
- ✅ Website crawler data available and accessible
- ✅ Multi-website architecture (Phase 4) for website selection
- ✅ User has at least one website with crawled data

### Integration Points
- **Website Context**: Requires active website selection
- **Crawler Data**: Must have recent crawl results
- **Content Generation**: Enhanced edge functions
- **User Preferences**: SEO Pro Mode preference saving

---

**Next Phase**: Phase 4 - Multi-Website Architecture  
**Completion Criteria**: SEO Pro Mode provides valuable internal link suggestions, content generation integrates crawler data effectively
