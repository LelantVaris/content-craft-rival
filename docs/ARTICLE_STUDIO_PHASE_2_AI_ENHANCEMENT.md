# Article Studio Phase 2: Enhanced AI Prompts & Data Integration

## Overview
**Priority**: HIGH - Depends on Phase 1 completion  
**Status**: 🔴 Not Started  
**Estimated Time**: 4-5 hours  
**Dependencies**: Phase 1 UI fixes must be complete

## Objectives

### Enhanced AI Context Integration
Currently, AI generation functions only use basic data (topic, keywords). We need to integrate all form data for more personalized and accurate content generation.

### User Preference Persistence
Save advanced customizations so users don't need to re-enter preferences for each new article.

## Data Integration Requirements

### Current AI Generation Functions
1. **generate-titles** (`supabase/functions/generate-titles/index.ts`)
2. **generate-outline** (`supabase/functions/generate-outline/index.ts`) 
3. **generate-content** (`supabase/functions/generate-content/index.ts`)
4. **generate-keywords** (`supabase/functions/generate-keywords/index.ts`)

### Data Sources to Integrate

#### From ContentBriefForm.tsx
```typescript
interface ArticleFormData {
  // Basic Info
  topic: string;
  keywords: string[];
  
  // Style & Format
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  length: 'short' | 'medium' | 'long'; // 800, 1500, 2500 words
  
  // Advanced Customizations
  pointOfView: 'first' | 'second' | 'third';
  audience: string;
  brand: string;
  product: string;
}
```

#### Word Count Mapping
```typescript
const lengthMapping = {
  short: { words: 800, description: '~800 words' },
  medium: { words: 1500, description: '~1,500 words' },
  long: { words: 2500, description: '~2,500 words' }
};
```

## Implementation Plan

### Step 1: Database Schema for User Preferences
**File**: New SQL migration

```sql
-- Create user preferences table for advanced customizations
CREATE TABLE IF NOT EXISTS public.user_article_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  point_of_view TEXT DEFAULT 'second',
  default_audience TEXT DEFAULT '',
  brand_description TEXT DEFAULT '',
  product_description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_article_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
  ON public.user_article_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own preferences" 
  ON public.user_article_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_article_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);
```

### Step 2: Enhanced Edge Function Prompts

#### generate-titles Enhancement
**File**: `supabase/functions/generate-titles/index.ts`

```typescript
// Enhanced prompt template
const generateTitlePrompt = (data: {
  topic: string;
  keywords: string[];
  tone: string;
  audience: string;
  brand: string;
  product: string;
  count: number;
}) => `
You are an expert content strategist. Generate ${data.count} compelling article titles for the following:

TOPIC: ${data.topic}

CONTEXT:
- Target Audience: ${data.audience || 'General audience'}
- Brand: ${data.brand || 'Not specified'}
- Product/Service: ${data.product || 'Not specified'}
- Tone: ${data.tone}
- Keywords to include: ${data.keywords.join(', ') || 'None specified'}

REQUIREMENTS:
- Titles should be attention-grabbing and SEO-friendly
- Incorporate provided keywords naturally when possible
- Match the specified tone (${data.tone})
- Relevant to the target audience
- Each title should be 8-12 words long
- Avoid clickbait; focus on value proposition

Return exactly ${data.count} unique titles, each on a new line.
`;
```

#### generate-outline Enhancement
**File**: `supabase/functions/generate-outline/index.ts`

```typescript
// Enhanced outline generation
const generateOutlinePrompt = (data: {
  title: string;
  topic: string;
  keywords: string[];
  tone: string;
  length: string;
  audience: string;
  brand: string;
  product: string;
  pointOfView: string;
}) => `
Create a detailed article outline for: "${data.title}"

SPECIFICATIONS:
- Target Length: ${getWordCount(data.length)} words
- Writing Style: ${data.tone}
- Point of View: ${data.pointOfView} person
- Target Audience: ${data.audience || 'General audience'}
- Brand Context: ${data.brand || 'Not specified'}
- Product/Service: ${data.product || 'Not specified'}

KEYWORDS TO INTEGRATE:
${data.keywords.join(', ') || 'None specified'}

OUTLINE REQUIREMENTS:
- Create 5-8 main sections for comprehensive coverage
- Each section should have 2-4 subsections
- Include character count estimates for each section
- Ensure logical flow and progression
- Optimize for SEO and readability
- Include introduction and conclusion sections

Return as JSON with this structure:
{
  "sections": [
    {
      "id": "unique-id",
      "title": "Section Title",
      "content": "Brief description of section content",
      "characterCount": 200,
      "expanded": true
    }
  ]
}
`;
```

#### generate-content Enhancement
**File**: `supabase/functions/generate-content/index.ts`

```typescript
// Enhanced content generation
const generateContentPrompt = (data: {
  title: string;
  outline: OutlineSection[];
  keywords: string[];
  tone: string;
  length: string;
  audience: string;
  brand: string;
  product: string;
  pointOfView: string;
}) => `
Write a comprehensive article based on the following specifications:

TITLE: ${data.title}

ARTICLE SPECIFICATIONS:
- Target Length: ${getWordCount(data.length)} words
- Writing Style: ${data.tone}
- Point of View: ${data.pointOfView} person
- Target Audience: ${data.audience || 'General audience'}
- Brand Voice: ${data.brand || 'Neutral'}
- Product/Service Context: ${data.product || 'Not specified'}

OUTLINE TO FOLLOW:
${data.outline.map((section, index) => `
${index + 1}. ${section.title}
   Content focus: ${section.content}
   Target length: ~${section.characterCount} characters
`).join('\n')}

KEYWORDS TO INTEGRATE NATURALLY:
${data.keywords.join(', ') || 'None specified'}

CONTENT REQUIREMENTS:
- Follow the provided outline structure exactly
- Maintain consistent tone throughout
- Include proper headings (H2, H3) for each section
- Integrate keywords naturally (target 1-2% density)
- Write engaging, informative content
- Include actionable insights where appropriate
- Optimize for readability and SEO
- Match the target word count: ${getWordCount(data.length)} words

Return the complete article in Markdown format.
`;
```

### Step 3: Frontend Integration

#### Enhanced useArticleStudio Hook
**File**: `src/hooks/useArticleStudio.ts`

```typescript
// Add user preferences to article data
export interface ArticleStudioData {
  // ... existing fields
  
  // Enhanced form data
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  length: 'short' | 'medium' | 'long';
  pointOfView: 'first' | 'second' | 'third';
  brand: string;
  product: string;
  
  // User preferences
  userPreferences: UserArticlePreferences | null;
}

// Load user preferences on initialization
const loadUserPreferences = async () => {
  const { data } = await supabase
    .from('user_article_preferences')
    .select('*')
    .single();
  
  if (data) {
    setArticleData(prev => ({
      ...prev,
      pointOfView: data.point_of_view,
      audience: data.default_audience,
      brand: data.brand_description,
      product: data.product_description,
      userPreferences: data
    }));
  }
};
```

#### Enhanced ContentBriefForm
**File**: `src/components/ArticleStudio/ContentBriefForm.tsx`

```typescript
// Add preference persistence
const handlePreferenceUpdate = async (updates: Partial<UserPreferences>) => {
  try {
    await supabase.from('user_article_preferences').upsert({
      user_id: user.id,
      ...updates,
      updated_at: new Date().toISOString()
    });
    
    // Update local state
    onUpdate({ ...updates });
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
};

// Auto-save preferences when advanced customizations change
useEffect(() => {
  if (articleData.pointOfView || articleData.audience || articleData.brand || articleData.product) {
    const debounceTimer = setTimeout(() => {
      handlePreferenceUpdate({
        point_of_view: articleData.pointOfView,
        default_audience: articleData.audience,
        brand_description: articleData.brand,
        product_description: articleData.product
      });
    }, 1000);
    
    return () => clearTimeout(debounceTimer);
  }
}, [articleData.pointOfView, articleData.audience, articleData.brand, articleData.product]);
```

## Testing & Validation

### AI Generation Quality Tests
- [ ] Titles reflect all provided context (audience, brand, tone)
- [ ] Outlines match target length specifications
- [ ] Content integrates keywords naturally
- [ ] Point of view consistency maintained
- [ ] Brand voice appropriately reflected

### Preference Persistence Tests
- [ ] Advanced customizations save automatically
- [ ] Preferences load on new article creation
- [ ] Multiple users don't see each other's preferences
- [ ] Updates persist across browser sessions

### Edge Function Tests
- [ ] All edge functions receive complete context
- [ ] Enhanced prompts generate higher quality content
- [ ] Word count targets are met consistently
- [ ] Error handling for missing optional fields

## Success Metrics

### Quality Improvements
- **Title Relevance**: 90%+ titles should match provided context
- **Content Length**: 95%+ articles within 10% of target length
- **SEO Integration**: Keywords naturally integrated in 90%+ of content
- **User Satisfaction**: Reduced manual editing required

### User Experience
- **Preference Persistence**: 100% of advanced customizations saved
- **Load Time**: Preferences loaded within 500ms
- **Error Rate**: <1% failed preference saves
- **Workflow Efficiency**: 50% reduction in form re-entry time

## Dependencies

### Required for Phase 2
- ✅ Phase 1 UI fixes complete
- ✅ All AI generation functions working
- ✅ Form data collection functional
- ✅ User authentication working

### Blocks Phase 3
- Enhanced AI prompts must be tested and functional
- User preferences must save/load correctly
- All edge functions must use complete context

---

**Next Phase**: Phase 3 - SEO Pro Mode & Crawler Integration  
**Completion Criteria**: All AI functions use enhanced prompts, user preferences persist correctly
