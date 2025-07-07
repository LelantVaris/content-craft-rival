
# Section-by-Section Article Generation Implementation Guide

## Overview
This guide outlines the complete migration from edge functions to AI SDK for section-by-section article generation, including integration of Novel editor for WYSIWYG editing experience.

## 🎯 Implementation Goals
- [ ] Replace single large article generation with section-by-section approach
- [ ] Migrate from Supabase Edge Functions to AI SDK
- [ ] Integrate Novel editor for Notion-style WYSIWYG editing
- [ ] Implement progressive content saving and error recovery
- [ ] Add section-level retry and regeneration capabilities

## 📋 Phase 1: Database Schema Updates
- [ ] Add `sections` JSONB field to articles table
- [ ] Add `generation_progress` field to track completion status
- [ ] Add `last_generated_section` field for resume capability

### Database Migration SQL
```sql
-- Add sections support to articles table
ALTER TABLE articles 
ADD COLUMN sections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN generation_progress JSONB DEFAULT '{}'::jsonb,
ADD COLUMN last_generated_section INTEGER DEFAULT 0;

-- Index for faster section queries
CREATE INDEX IF NOT EXISTS idx_articles_sections ON articles USING gin(sections);
```

## 📋 Phase 2: AI SDK Integration

### 2.1 Install Novel Editor Dependencies
- [ ] Install Novel editor package
- [ ] Configure Novel with Tailwind CSS
- [ ] Set up editor extensions and plugins

```bash
npm install novel @tiptap/react @tiptap/starter-kit
```

### 2.2 Create Section Generation Hook
- [ ] Create `useSectionGeneration` hook
- [ ] Implement section-by-section logic
- [ ] Add progress tracking and error handling

### 2.3 Section Generation API Client
- [ ] Create client-side AI SDK integration
- [ ] Implement streaming for individual sections
- [ ] Add retry mechanism for failed sections

## 📋 Phase 3: Frontend Components

### 3.1 Novel Editor Integration
- [ ] Replace ArticlePreview with Novel editor
- [ ] Configure editor with custom styling
- [ ] Add section-level editing capabilities

### 3.2 Progress UI Components
- [ ] Create section progress indicator
- [ ] Add per-section retry buttons
- [ ] Implement real-time status updates

### 3.3 Section Management
- [ ] Add section reordering capabilities
- [ ] Implement section deletion/regeneration
- [ ] Add section-level word count tracking

## 🔧 Technical Implementation Details

### PVOD Prompt Templates

#### Main Article Context Prompt
```typescript
const buildArticleContextPrompt = (params: ArticleParams) => `
You are an expert content writer creating high-quality articles following the PVOD (Personality, Value, Opinion, Direct) framework.

## ARTICLE CONTEXT:
- **Title**: ${params.title}
- **Primary Keyword**: ${params.primaryKeyword}
- **Secondary Keywords**: ${params.keywords.join(', ')}
- **Target Audience**: ${params.audience}
- **Tone**: ${params.tone}
- **Point of View**: ${params.pointOfView}
- **Search Intent**: ${params.searchIntent}
- **Brand Context**: ${params.brand}
- **Product Context**: ${params.product}
- **Target Word Count**: ${params.targetWordCount} total words
- **Total Sections**: ${params.outline.length}

## PVOD FRAMEWORK REQUIREMENTS:
### P - PERSONALITY (Human, Not AI):
- Write with authentic voice and clear personality
- Use conversational tone and relatable examples
- Address reader directly using "${params.pointOfView}" person perspective
- Avoid AI-generated tropes and generic phrasing

### V - VALUE (High Value Density):
- Provide actionable, implementable advice
- Include specific examples with concrete details
- Answer what readers need to know beyond obvious information
- Every paragraph must add genuine value

### O - OPINION (Novel Perspective):
- Present unique angles and fresh insights
- Include supported opinions backed by examples
- Challenge assumptions where appropriate
- Avoid generic, neutral statements

### D - DIRECT (No Fluff):
- Maximum 4 lines per paragraph
- Use short, varied sentences
- Create logical flow between ideas
- Break up text with headers and lists

## FULL ARTICLE OUTLINE:
${params.outline.map((section, index) => 
  `${index + 1}. ${section.title}\n   - ${section.content}`
).join('\n')}
`;
```

#### Section Generation Prompt
```typescript
const buildSectionPrompt = (
  articleContext: string,
  sectionData: OutlineSection,
  sectionIndex: number,
  previousContent: string,
  nextSectionTitle?: string
) => `
${articleContext}

## CURRENT TASK:
Generate Section ${sectionIndex + 1}: "${sectionData.title}"

### Section Requirements:
- **Word Count Target**: ${Math.floor(4000 / outline.length)} words (±50 words acceptable)
- **Section Description**: ${sectionData.content}
- **Position**: Section ${sectionIndex + 1} of ${outline.length}

### Context for Continuity:
${previousContent ? `
**Previous Section Ending**:
${previousContent.split('\n').slice(-3).join('\n')}
` : 'This is the first section after introduction.'}

${nextSectionTitle ? `
**Next Section Preview**: "${nextSectionTitle}" - ensure smooth transition
` : 'This is the final section - provide strong conclusion.'}

### Section-Specific Guidelines:
${sectionIndex === 0 ? `
- Hook the reader immediately
- Include primary keyword within first 50 words
- Set clear expectations for the article
` : sectionIndex === outline.length - 1 ? `
- Summarize key takeaways
- Include compelling call-to-action
- Reinforce primary keyword naturally
` : `
- Build upon previous section's points
- Introduce 2-3 new actionable insights
- Use subheadings to break up content
`}

## OUTPUT REQUIREMENTS:
- Use markdown formatting (## headers, **bold**, *italic*, lists)
- Include specific examples and case studies
- Add 1-2 "Pro Tips" or expert insights
- Naturally integrate keywords for SEO
- Ensure content flows logically from previous section

Generate ONLY the content for Section ${sectionIndex + 1}. Do not include the section title as a header (it will be added automatically).
`;
```

### AI SDK Implementation Examples

#### Section Generation Client
```typescript
// Client-side AI integration
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateSection(
  articleContext: string,
  sectionData: OutlineSection,
  sectionIndex: number,
  previousContent: string
): Promise<string> {
  const prompt = buildSectionPrompt(
    articleContext, 
    sectionData, 
    sectionIndex, 
    previousContent
  );

  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt,
    maxTokens: 2000,
    temperature: 0.7,
  });

  return text;
}
```

#### Streaming Section Generation
```typescript
// Streaming implementation for real-time updates
import { streamText } from 'ai';

export async function streamSectionGeneration(
  articleContext: string,
  sectionData: OutlineSection,
  sectionIndex: number,
  onUpdate: (content: string) => void
) {
  const prompt = buildSectionPrompt(articleContext, sectionData, sectionIndex);

  const { textStream } = await streamText({
    model: openai('gpt-4o'),
    prompt,
    maxTokens: 2000,
    temperature: 0.7,
  });

  let fullContent = '';
  for await (const delta of textStream) {
    fullContent += delta;
    onUpdate(fullContent);
  }

  return fullContent;
}
```

### Novel Editor Configuration

#### Basic Editor Setup
```typescript
// Novel editor configuration
import { EditorRoot, EditorContent } from 'novel';
import { defaultExtensions } from './extensions';

export function ArticleEditor({ content, onChange }: EditorProps) {
  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        extensions={defaultExtensions}
        onUpdate={({ editor }) => {
          onChange(editor.getHTML());
        }}
        className="min-h-[600px] w-full"
        editorProps={{
          attributes: {
            class: "prose prose-lg max-w-none focus:outline-none",
          },
        }}
      />
    </EditorRoot>
  );
}
```

#### Custom Extensions for Sections
```typescript
// Section-aware editor extensions
import { Node } from '@tiptap/core';

export const SectionNode = Node.create({
  name: 'section',
  content: 'block+',
  group: 'block',
  
  addAttributes() {
    return {
      sectionId: {
        default: null,
      },
      isGenerating: {
        default: false,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 
      ...HTMLAttributes, 
      class: 'section-block border-l-4 border-blue-200 pl-4 mb-6' 
    }, 0];
  },
});
```

## 📋 Phase 4: Error Handling & Recovery

### 4.1 Section-Level Error Recovery
- [ ] Implement automatic retry for failed sections
- [ ] Add manual retry buttons for each section
- [ ] Store partial progress in database

### 4.2 User Experience Enhancements
- [ ] Show generation progress per section
- [ ] Allow editing while other sections generate
- [ ] Implement auto-save for completed sections

## 🔗 API References

### AI SDK Core Functions
- `generateText()` - Single text generation
- `streamText()` - Streaming text generation
- `generateObject()` - Structured output generation

### Novel Editor API
- `EditorRoot` - Main editor wrapper
- `EditorContent` - Editable content area
- `EditorCommand` - Command palette integration
- Custom extensions for enhanced functionality

### Supabase Integration
- Real-time updates for collaborative editing
- Automatic section saving and recovery
- Progress tracking and status management

## ✅ Implementation Checklist

### Backend (AI SDK Migration)
- [ ] Remove existing edge functions
- [ ] Set up AI SDK with OpenAI provider
- [ ] Implement section generation logic
- [ ] Add error handling and retry mechanisms

### Frontend (Novel Integration)
- [ ] Install and configure Novel editor
- [ ] Create section-aware editing interface
- [ ] Implement progress tracking UI
- [ ] Add retry buttons and status indicators

### Database & State Management
- [ ] Update articles table schema
- [ ] Implement section-based storage
- [ ] Add progress tracking fields
- [ ] Create recovery mechanisms

### Testing & Validation
- [ ] Test section generation flow
- [ ] Validate PVOD prompt effectiveness
- [ ] Ensure proper error recovery
- [ ] Test editor integration

## 📊 Expected Benefits

### Performance Improvements
- Faster perceived loading (progressive generation)
- Lower memory usage (smaller requests)
- Better error recovery (section-level retries)
- Reduced timeout issues

### User Experience
- Real-time content preview
- Notion-style editing experience
- Section-level control and editing
- Progressive article building

### Maintainability
- Simpler client-side AI integration
- Reduced edge function complexity
- Better error handling and debugging
- More modular architecture

## 🚀 Migration Strategy

1. **Start with Database Schema** - Add sections support
2. **Implement AI SDK Integration** - Replace edge functions
3. **Add Novel Editor** - Replace current preview
4. **Enhanced UX Features** - Progress tracking, retries
5. **Testing & Optimization** - Validate complete flow

## Questions for Implementation

1. Should we maintain backward compatibility with existing articles?
2. What's the preferred section word count distribution?
3. Should sections be editable independently during generation?
4. How should we handle section reordering in the editor?
5. What Novel editor extensions should we include by default?
