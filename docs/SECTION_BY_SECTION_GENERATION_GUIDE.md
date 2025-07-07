
# Section-by-Section Article Generation Implementation Guide

## Overview
This guide outlines the complete migration from edge functions to AI SDK for section-by-section article generation, including integration of Novel editor for WYSIWYG editing experience.

## 🎯 Implementation Goals
- [ ] Replace single large article generation with section-by-section approach
- [ ] Migrate from Supabase Edge Functions to AI SDK
- [ ] Integrate Novel editor as primary WYSIWYG editor throughout the app
- [ ] Implement progressive content saving and error recovery
- [ ] Add section-level retry and regeneration capabilities
- [ ] Replace full-article generation completely

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
**File**: `src/hooks/useSectionGeneration.ts`
- [ ] Create `useSectionGeneration` hook
- [ ] Implement section-by-section logic
- [ ] Add progress tracking and error handling

```typescript
import { useState, useCallback } from 'react';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface SectionData {
  title: string;
  content: string;
  wordCount?: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export function useSectionGeneration() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateSection = useCallback(async (
    sectionIndex: number,
    context: string,
    previousContent: string
  ) => {
    // Implementation details
  }, []);

  return {
    sections,
    currentSection,
    isGenerating,
    progress,
    generateSection,
    retrySection: (index: number) => generateSection(index, '', ''),
  };
}
```

### 2.3 Section Generation API Client
**File**: `src/lib/sectionGeneration.ts`
- [ ] Create client-side AI SDK integration
- [ ] Implement streaming for individual sections
- [ ] Add retry mechanism for failed sections

```typescript
import { streamText } from 'ai';
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

  const { text } = await streamText({
    model: openai('gpt-4o'),
    prompt,
    maxTokens: 2000,
    temperature: 0.7,
  });

  return text;
}
```

## 📋 Phase 3: Novel Editor Integration (Primary Editor)

### 3.1 Novel Editor Setup and Configuration
**File**: `src/components/NovelEditor/index.tsx`

#### Install Dependencies
```bash
npm install novel @tiptap/react @tiptap/starter-kit class-variance-authority
```

#### Default Extensions Configuration
**File**: `src/components/NovelEditor/extensions.ts`
```typescript
import {
  TiptapImage,
  TiptapLink,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
} from "novel/extensions";
import { cx } from "class-variance-authority";

// You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-sm bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  TiptapImage,
  UpdatedImage,
  taskList,
  taskItem,
  horizontalRule,
];
```

#### Tailwind Intellisense Configuration
Add to VS Code settings.json:
```json
"tailwindCSS.experimental.classRegex": [
  ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
]
```

#### Slash Command Configuration
**File**: `src/components/NovelEditor/suggestionItems.tsx`
```typescript
import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  MessageSquarePlus,
  Text,
  TextQuote,
} from "lucide-react";
import { createSuggestionItems } from "novel/extensions";
import { Command, renderItems } from "novel/extensions";

export const suggestionItems = createSuggestionItems([
  {
    title: "Send Feedback",
    description: "Let us know how we can improve.",
    icon: <MessageSquarePlus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      window.open("/feedback", "_blank");
    },
  },
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
```

#### Bubble Menu Configuration
**File**: `src/components/NovelEditor/editor.tsx`
```typescript
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";
import { TextButtons } from "./selectors/text-buttons";

// In your editor component:
<EditorContent>
  <EditorBubble
    tippyOptions={{
      placement: openAI ? "bottom-start" : "top",
    }}
    className='flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl'>
      <NodeSelector open={openNode} onOpenChange={setOpenNode} />
      <LinkSelector open={openLink} onOpenChange={setOpenLink} />
      <TextButtons />
      <ColorSelector open={openColor} onOpenChange={setOpenColor} />
  </EditorBubble>
</EditorContent>
```

#### Slash Command UI Implementation
```typescript
// Command palette UI
<EditorContent>
  <EditorCommand className='z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all'>
    <EditorCommandEmpty className='px-2 text-muted-foreground'>No results</EditorCommandEmpty>
    <EditorCommandList>
      {suggestionItems.map((item) => (
        <EditorCommandItem
          value={item.title}
          onCommand={(val) => item.command(val)}
          className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
          key={item.title}>
          <div className='flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background'>
            {item.icon}
          </div>
          <div>
            <p className='font-medium'>{item.title}</p>
            <p className='text-xs text-muted-foreground'>{item.description}</p>
          </div>
        </EditorCommandItem>
      ))}
    </EditorCommandList>
  </EditorCommand>
</EditorContent>
```

### 3.2 Complete Novel Editor Setup
**Files to create**:
- [ ] `src/components/NovelEditor/NovelEditor.tsx` - Main editor component
- [ ] `src/components/NovelEditor/selectors/` - Bubble menu selectors
- [ ] Add section-level editing capabilities
- [ ] Implement real-time collaboration features

### 3.3 App-wide Novel Integration
**Files to update**:
- [ ] `src/components/ArticleStudio/StreamingArticlePreview.tsx` - Replace with Novel editor
- [ ] `src/pages/ArticleStudio.tsx` - Update to use Novel
- [ ] `src/components/ArticleEditor/ContentEditor.tsx` - Update to use Novel
- [ ] All text editing components throughout the app

## 📋 Phase 4: Exact Prompt Preservation

### 4.1 Main Article Context Prompt (PRESERVED EXACTLY)
**File**: `src/lib/prompts/articleContext.ts`
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

### 4.2 Section Generation Prompt (PRESERVED EXACTLY)
**File**: `src/lib/prompts/sectionPrompt.ts`
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
- **Word Count Target**: ${getWeightedWordCount(sectionData, sectionIndex)} words (±50 words acceptable)
- **Section Description**: ${sectionData.content}
- **Position**: Section ${sectionIndex + 1} of ${outline.length}
- **Section Importance**: ${getSectionImportance(sectionData)}

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

### 4.3 Weighted Word Count Distribution
**File**: `src/lib/utils/wordCountDistribution.ts`
```typescript
// Helper function for weighted section word counts based on importance
const getWeightedWordCount = (section: OutlineSection, index: number, totalWords: number = 4000) => {
  const importance = getSectionImportance(section);
  const basePerSection = totalWords / outline.length;
  
  switch (importance) {
    case 'high': return Math.floor(basePerSection * 1.3);
    case 'medium': return Math.floor(basePerSection * 1.0);
    case 'low': return Math.floor(basePerSection * 0.7);
    default: return Math.floor(basePerSection);
  }
};

const getSectionImportance = (section: OutlineSection): 'high' | 'medium' | 'low' => {
  // Introduction and conclusion are high importance
  if (section.title.toLowerCase().includes('introduction') || 
      section.title.toLowerCase().includes('conclusion')) {
    return 'high';
  }
  
  // Main content sections are medium
  if (section.content.length > 100) {
    return 'medium';
  }
  
  // Short sections are low importance
  return 'low';
};
```

## 📋 Phase 5: AI SDK Implementation

### 5.1 Section Generation Client
**File**: `src/lib/ai/sectionGeneration.ts`
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

### 5.2 Streaming Section Generation
**File**: `src/lib/ai/streamingSectionGeneration.ts`
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

### 5.3 Complete Section-by-Section Hook
**File**: `src/hooks/useSectionGeneration.ts`
```typescript
export function useSectionGeneration() {
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateAllSections = async (params: ArticleParams) => {
    setIsGenerating(true);
    const articleContext = buildArticleContextPrompt(params);
    
    for (let i = 0; i < params.outline.length; i++) {
      setCurrentSection(i);
      const previousContent = sections[i - 1]?.content || '';
      
      try {
        const content = await streamSectionGeneration(
          articleContext,
          params.outline[i],
          i,
          (partialContent) => {
            // Update section in real-time
            setSections(prev => {
              const updated = [...prev];
              updated[i] = { ...params.outline[i], content: partialContent };
              return updated;
            });
          }
        );
        
        // Save completed section to database
        await saveSectionToDatabase(params.articleId, i, content);
        
        setProgress(((i + 1) / params.outline.length) * 100);
      } catch (error) {
        console.error(`Failed to generate section ${i}:`, error);
        // Implement retry logic here
      }
    }
    
    setIsGenerating(false);
  };

  return {
    generateAllSections,
    currentSection,
    sections,
    isGenerating,
    progress,
    retrySection: (index: number) => {
      // Implement single section retry
    }
  };
}
```

## 📋 Phase 6: Error Handling & Recovery

### 6.1 Section-Level Error Recovery
**File**: `src/hooks/useGenerationRecovery.ts`
- [ ] Implement automatic retry for failed sections
- [ ] Add manual retry buttons for each section
- [ ] Store partial progress in database
- [ ] Resume generation from last completed section

### 6.2 User Experience Enhancements
**Files to update**:
- [ ] `src/components/ArticleStudio/SectionProgress.tsx` - Show generation progress per section
- [ ] `src/components/ArticleStudio/SectionRetry.tsx` - Allow editing while other sections generate
- [ ] `src/lib/storage/autoSave.ts` - Implement auto-save for completed sections
- [ ] `src/components/NovelEditor/SectionReorder.tsx` - Add section reordering in Novel editor

## 🔗 API References

### AI SDK Core Functions
- `generateText()` - Single text generation
- `streamText()` - Streaming text generation
- `generateObject()` - Structured output generation

### Novel Editor API
- `EditorRoot` - Main editor wrapper
- `EditorContent` - Editable content area
- `EditorCommand` - Command palette integration
- `EditorBubble` - Bubble menu for formatting
- `EditorCommandItem` - Individual command items
- Custom extensions for enhanced functionality

### Novel Extensions Used
- `StarterKit` - Basic editing functionality
- `TiptapLink` - Link handling with custom styling
- `TiptapImage` - Image embedding
- `UpdatedImage` - Enhanced image features
- `TaskList` & `TaskItem` - Todo functionality
- `HorizontalRule` - Divider elements
- `Placeholder` - Placeholder text
- `Command` - Slash command system

### Supabase Integration
- Real-time updates for collaborative editing
- Automatic section saving and recovery
- Progress tracking and status management

## ✅ Implementation Checklist

### Backend (AI SDK Migration)
- [ ] Remove existing edge functions completely
- [ ] Set up AI SDK with OpenAI provider
- [ ] Implement section generation logic
- [ ] Add error handling and retry mechanisms
- [ ] Add weighted word count distribution

### Novel Editor (Primary Editor Integration)
- [ ] Create isolated Novel editor component
- [ ] Install and configure all Novel extensions
- [ ] Set up slash commands and bubble menu
- [ ] Configure Tailwind integration
- [ ] Test all editor functionality

### Frontend (Complete Novel Integration)
- [ ] Replace ArticlePreview with Novel editor
- [ ] Update Article Studio to use Novel
- [ ] Update Article Editor to use Novel
- [ ] Implement section-aware editing interface
- [ ] Add progress tracking UI
- [ ] Add retry buttons and status indicators

### Database & State Management
- [ ] Update articles table schema (sections, progress tracking)
- [ ] Implement section-based storage
- [ ] Add progress tracking fields
- [ ] Create recovery mechanisms

### App-wide Refactoring
- [ ] Replace all text editing components with Novel
- [ ] Update all markdown preview components
- [ ] Ensure consistent editor experience
- [ ] Test Novel editor across all use cases

### Testing & Validation
- [ ] Test section generation flow
- [ ] Validate PVOD prompt effectiveness
- [ ] Ensure proper error recovery
- [ ] Test Novel editor integration
- [ ] Validate weighted word count distribution

## 📊 Expected Benefits

### Performance Improvements
- Faster perceived loading (progressive generation)
- Lower memory usage (smaller requests)
- Better error recovery (section-level retries)
- Reduced timeout issues

### User Experience
- Real-time content preview with Novel editor
- Notion-style editing experience throughout app
- Section-level control and editing
- Progressive article building
- Consistent WYSIWYG experience

### Maintainability
- Simpler client-side AI integration
- Reduced edge function complexity
- Better error handling and debugging
- More modular architecture
- Unified editing experience

## 🚀 Migration Strategy

1. **Start with Database Schema** - Add sections support
2. **Create Isolated Novel Component** - Build and test Novel editor
3. **Implement AI SDK Integration** - Replace edge functions
4. **Add Novel Throughout App** - Replace all text editing
5. **Enhanced UX Features** - Progress tracking, retries
6. **Testing & Optimization** - Validate complete flow

## ❓ Implementation Questions

### Novel Editor Integration
1. Should we maintain backward compatibility with existing markdown content?
2. How should we handle the conversion from markdown to Novel's JSON structure?
3. What's the preferred approach for handling collaborative editing conflicts?
4. Should sections be editable independently during generation?
5. How should we handle section reordering in the Novel editor?

### Technical Implementation
1. Should we implement section generation as a queue system?
2. What's the preferred error recovery strategy for failed sections?
3. How should we handle partial content when switching between sections?
4. Should we implement real-time collaboration features immediately?

### User Experience
1. Should users be able to edit generated sections immediately?
2. How should we handle conflicts between user edits and ongoing generation?
3. What visual indicators should we use for generation progress?
4. Should we allow users to pause/resume generation?

### Database and State Management
1. Should we store intermediate generation states?
2. How should we handle version control for edited sections?
3. What's the preferred approach for auto-saving during generation?
4. Should we implement section-level revision history?

### Migration Strategy
1. Should we run old and new systems in parallel during migration?
2. How should we handle existing articles during the transition?
3. What's the rollback strategy if issues arise?
4. Should we migrate users gradually or all at once?
