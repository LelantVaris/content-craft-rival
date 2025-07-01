
# Article Studio Implementation Guide

## Development Roadmap

### Phase 1: Database Schema & Core Components

#### 1.1 Database Setup (PRIORITY: CRITICAL)
- [ ] Create the SEO preferences table for user settings persistence:

```sql
-- User SEO preferences for Article Studio
CREATE TABLE public.user_seo_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  target_audience TEXT DEFAULT '',
  preferred_keywords TEXT[] DEFAULT '{}',
  default_tone TEXT DEFAULT 'professional',
  default_length TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_seo_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own SEO preferences" 
  ON public.user_seo_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SEO preferences" 
  ON public.user_seo_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO preferences" 
  ON public.user_seo_preferences FOR UPDATE 
  USING (auth.uid() = user_id);
```

#### 1.2 Core Layout Components
**File Structure**:
```
src/components/ArticleStudio/
├── ArticleStudioLayout.tsx          # Main resizable layout
├── StepProgress.tsx                 # Progress indicator
├── TitleInputStep.tsx               # Step 1 form with examples
├── SEOProModeToggle.tsx            # Collapsible SEO settings
├── EmptyStateDisplay.tsx           # Right panel empty state
└── TitleGenerationControls.tsx     # Generate button + counter
```

**Key Implementation Details**:
- [ ] Use `react-resizable-panels` for 40/60 layout
- [ ] Implement collapsible SEO Pro Mode with smooth animations
- [ ] Add "Try Example" button with Marketing/B2B/Sales/Startup topics
- [ ] Create number selector for title count (3-10, default 5)

#### 1.3 State Management Enhancement
- [ ] **File**: `src/hooks/useArticleStudioWorkflow.ts`

```typescript
interface ArticleStudioState {
  currentStep: 1 | 2 | 3 | 4;
  topic: string;
  seoProMode: boolean;
  seoSettings: {
    targetAudience: string;
    keywords: string[];
    tone: 'professional' | 'casual' | 'technical' | 'friendly';
    length: 'short' | 'medium' | 'long';
    savedToDatabase: boolean;
  };
  titleCount: number;
  generatedTitles: string[];
  selectedTitle: string;
  outline: OutlineSection[];
  generationProgress: {
    currentSection: number;
    isGenerating: boolean;
    sectionStatus: SectionStatus[];
    phase: 'skeleton' | 'enhancing' | 'complete';
  };
  articleContent: JSONContent;
  simultaneousEditing: boolean;
}
```

### Phase 2: AI SDK Migration (CRITICAL FIX)

#### 2.1 Root Cause Analysis
- [ ] **Current Issues**:
  - [ ] React Error #31: Objects rendered as React children due to type safety violations
  - [ ] Streaming failures: Manual SSE parsing in `generate-content/index.ts` fails silently
  - [ ] Type issues: `streamingStatus` typed as `any` instead of `string`
  - [ ] Complex error handling leading to stream termination

#### 2.2 AI SDK Implementation Plan
- [ ] **Step 1**: Install AI SDK dependencies
```bash
npm install ai @ai-sdk/react @ai-sdk/openai
```

- [ ] **Step 2**: Create new API route structure
- [ ] **File**: `src/api/chat/route.ts`
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { title, outline, keywords, audience, tone } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      { role: 'system', content: 'You are an expert content writer...' },
      { role: 'user', content: generatePrompt(title, outline, keywords, audience, tone) }
    ],
    temperature: 0.7,
    maxTokens: 4000,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 3**: Replace frontend manual streaming
Replace complex manual fetch and stream parsing with:
```typescript
import { useChat } from '@ai-sdk/react';

const { messages, input, handleSubmit, isLoading, error } = useChat({
  api: '/api/chat',
  maxSteps: 5,
  onError: (error) => console.error('Streaming error:', error)
});
```

#### 2.3 Type Safety Improvements
**Files to Update**:
- [ ] `StreamingArticlePreview.tsx`: Replace `streamingStatus?: any` with proper AI SDK types
- [ ] `LivePreviewPanel.tsx`: Remove manual type guards and string validation
- [ ] `useArticleStudio.ts`: Use AI SDK's built-in message and error types

### Phase 3: Two-Phase Content Generation

#### 3.1 Generation Flow Architecture
- [ ] **Phase 1: Skeleton Generation**
  - [ ] Generate basic content structure without web search
  - [ ] Fast initial content to show progress
  - [ ] Foundation for enhancement phase

- [ ] **Phase 2: Web Enhancement**
  - [ ] Research each section with OpenAI (primary) or Tavily (upgrade)
  - [ ] Enhance content with latest insights and data
  - [ ] Maintain content structure while improving quality

#### 3.2 Progress Status Implementation
- [ ] **Single-line status updates** that replace each other:
```typescript
const progressMessages = [
  "Generating article outline...",
  "Writing introduction...",
  "Researching latest trends for '{section}'...",
  "Enhancing section with industry insights...",
  "Finalizing content..."
];
```

#### 3.3 Novel Editor Integration
- [ ] **Simultaneous Editing Strategy**:
  - [ ] Use editor's JSON format for precise content placement
  - [ ] Transaction-based updates for conflict-free insertion
  - [ ] Progress indicators within editor content
  - [ ] Preserve all existing Novel AI features (slash commands, bubble menu)

- [ ] **Implementation Pattern**:
```typescript
// Insert content at specific editor positions
editor.chain()
  .focus()
  .insertContentAt(position, {
    type: 'paragraph',
    content: [{ type: 'text', text: generatedContent }]
  })
  .run();
```

### Phase 4: Enhanced Features Implementation

#### 4.1 Title Generation Enhancement
- [ ] **File**: `supabase/functions/generate-titles/index.ts`
  - [ ] Integrate SEO parameters (keywords, audience, tone)
  - [ ] Generate 3-10 titles based on user selection
  - [ ] Include title scoring and SEO optimization
  - [ ] Add fallback error handling

#### 4.2 Outline Creation System
- [ ] **Components**:
  - [ ] `OutlineCreationStep.tsx`: Main outline interface
  - [ ] `OutlineEditor.tsx`: Drag-and-drop outline management
  - [ ] Hierarchical display with character count estimates
  - [ ] Add/remove/reorder sections with visual feedback

#### 4.3 SEO Integration Throughout
- [ ] Real-time keyword density tracking
- [ ] Readability score calculation
- [ ] Meta description generation
- [ ] Content optimization suggestions

## Technical Implementation Details

### File Creation Checklist

#### Core Components (Phase 1)
- [ ] `ArticleStudioLayout.tsx` - Main resizable layout wrapper
- [ ] `StepProgress.tsx` - Step indicator with progress tracking
- [ ] `TitleInputStep.tsx` - Step 1 form components
- [ ] `SEOProModeToggle.tsx` - Collapsible SEO settings panel
- [ ] `EmptyStateDisplay.tsx` - Right panel empty state
- [ ] `TitleGenerationControls.tsx` - Number selector and generate button

#### Enhanced Hooks (Phase 1-2)
- [ ] `useArticleStudioWorkflow.ts` - 4-step state machine with persistence
- [ ] `useTwoPhaseGeneration.ts` - Skeleton → Enhanced content generation
- [ ] `useSEOConfiguration.ts` - SEO settings with database persistence
- [ ] `useProgressStatus.ts` - Single-line status management

#### AI Integration (Phase 2)
- [ ] `src/api/chat/route.ts` - AI SDK streaming endpoint
- [ ] Enhanced `generate-titles` function with SEO parameters
- [ ] Enhanced `generate-content` function with two-phase generation
- [ ] Rate limiting and retry logic implementation

#### Advanced Components (Phase 3-4)
- [ ] `TitleSelectionStep.tsx` - Step 2 title selection interface
- [ ] `OutlineCreationStep.tsx` - Step 3 outline builder
- [ ] `ArticleGenerationStep.tsx` - Step 4 generation interface
- [ ] `OutlineEditor.tsx` - Drag-and-drop outline interface
- [ ] `EnhancedNovelEditor.tsx` - Novel editor with streaming capabilities

### Database Integration Points

#### Required Database Functions
```sql
-- Upsert SEO preferences (already exists)
CREATE OR REPLACE FUNCTION upsert_seo_preferences(...)

-- New function for article generation tracking
CREATE FUNCTION track_generation_progress(
  p_user_id UUID,
  p_article_id UUID,
  p_current_step INTEGER,
  p_progress_data JSONB
) RETURNS void;
```

#### Credit System Integration
- [ ] Title generation: 0 credits (part of flow)
- [ ] Outline generation: 0 credits (part of flow)
- [ ] Content generation: 0 credits (part of flow)
- [ ] Stand-alone usage: 1 credit per operation

### Performance Optimization Strategy

#### Caching Implementation
- [ ] Cache generated titles for session
- [ ] Store outline structures for quick editing
- [ ] Implement progressive content loading
- [ ] Use debounced auto-save for SEO settings

#### Error Recovery
- [ ] Graceful degradation when API calls fail
- [ ] Retry logic with exponential backoff
- [ ] Fallback to skeleton content if enhancement fails
- [ ] Comprehensive error boundaries

#### Memory Management
- [ ] Efficient re-rendering with React.memo
- [ ] Cleanup of event listeners and subscriptions
- [ ] Optimized drag-and-drop operations
- [ ] Lazy loading of non-critical components

## Testing Strategy

### Component Testing
- [ ] Unit tests for all new hooks
- [ ] Integration tests for multi-step workflow
- [ ] Accessibility testing for all UI components
- [ ] Performance testing with large content volumes

### End-to-End Testing
- [ ] Complete article creation workflow
- [ ] SEO settings persistence across sessions
- [ ] Streaming content generation reliability
- [ ] Simultaneous editing conflict resolution

### User Acceptance Testing
- [ ] Article creation time measurement
- [ ] Content quality assessment
- [ ] User satisfaction surveys
- [ ] Feature adoption tracking

## Deployment Strategy

### Gradual Migration Plan
- [ ] **Phase 1**: Build alongside existing components
- [ ] **Phase 2**: Feature flag for beta testing
- [ ] **Phase 3**: Gradual user migration
- [ ] **Phase 4**: Full replacement of old wizard

### Rollback Strategy
- [ ] Maintain existing components during migration
- [ ] Database schema backward compatible
- [ ] Feature flags for instant rollback
- [ ] Comprehensive monitoring and alerting

This implementation guide provides the detailed technical roadmap for executing the Article Studio Master Plan with clear priorities, specific file structures, and comprehensive implementation details.
