
# Article Studio Redesign Implementation Plan

## Overview
Complete redesign of the Article Studio to implement a 4-step workflow with enhanced UX, SEO features, and real-time article generation using Novel WYSIWYG editor with simultaneous editing capability.

## Layout Architecture

### Main Layout (40/60 Resizable)
- **Left Panel (40%)**: Step-based controls and forms
- **Right Panel (60%)**: Dynamic content preview area
- **Technology**: Continue using `react-resizable-panels` for the resizable layout

## Updated Requirements Based on User Feedback

### Web Search Integration
- **Primary Choice**: Firecrawl for web research
- **Fallback Options**: Tavily or raw OpenAI
- **Goal**: Simplest MVP implementation
- **Usage**: Each outline section will use dedicated web search before content generation

### Novel Editor Integration
- **Simultaneous Editing**: Enable users to edit while content streams
- **AI Features**: Leverage Novel's built-in AI capabilities (slash commands, bubble menu)
- **Implementation**: Use editor JSON structure for precise content insertion
- **Streaming**: Insert generated content at specific positions without conflicts

### SEO Data Persistence
- **Storage**: Save SEO settings to database for user preferences
- **Restart Capability**: Users can restart with saved preferences
- **Session Management**: Maintain settings across sessions

## Step-by-Step Implementation Plan

### Step 1: Title Input & Configuration

#### Left Panel Components:
1. **Main Topic Input**
   - Large text input field with label "Write an article about..."
   - "Try Example" button with icon (aligned right, space-between with label)
   - Functionality: Populate random example topics

2. **SEO Pro Mode Toggle Section**
   - Toggle switch next to "SEO Pro Mode" label
   - Collapsible section revealing:
     - Target Audience (text input)
     - Keywords (text input with tag functionality)
     - Tone (select dropdown: Professional, Casual, Technical, etc.)
     - Length (select dropdown: Short (500-800), Medium (800-1500), Long (1500+))

3. **Generation Controls**
   - "Generate Titles" button (primary)
   - Number selector (- / + buttons) for title count (default: 5, range: 3-10)

#### Right Panel:
- **Empty State Component**
  - Small title: "No titles generated"
  - Description: "Describe your topic to our AI to start generating creative article ideas and titles."
  - "Need help?" link
  - "Write my own title" button (secondary)

### Step 2: Title Selection

#### Left Panel:
- Same form as Step 1 but in "review" mode
- Form values locked/readonly with edit capability
- Progress indicator showing current step

#### Right Panel:
- **Generated Titles List**
  - Display generated titles in selectable cards
  - Auto-select first title
  - Visual selection state
  - Option to regenerate or add custom title

### Step 3: Outline Creation

#### Left Panel:
- Outline management controls
- Add/remove headline buttons
- Drag-and-drop reordering interface
- Sub-headline creation tools

#### Right Panel:
- **Outline Preview**
  - Hierarchical display of headlines and sub-headlines
  - Drag-and-drop functionality
  - Inline editing capabilities
  - Character count estimates per section

### Step 4: Article Generation

#### Left Panel:
- Generation progress tracking
- Section-by-section status updates
- Controls to pause/resume generation
- Final review and edit options

#### Right Panel:
- **Novel WYSIWYG Editor Integration**
  - Real-time streaming content display with simultaneous editing
  - Full editing capabilities during and after generation
  - Section-by-section generation with progress indicators
  - Leverage Novel's built-in AI features
  - Web search indicators: "Searching with Firecrawl for latest insights on [topic]..."

## Technical Requirements

### New Components to Create:
1. `ArticleStudioLayout.tsx` - Main resizable layout wrapper
2. `StepProgress.tsx` - Step indicator component
3. `TitleInputStep.tsx` - Step 1 form components
4. `SEOProModeToggle.tsx` - Collapsible SEO settings
5. `TitleSelectionStep.tsx` - Step 2 title selection
6. `OutlineCreationStep.tsx` - Step 3 outline builder
7. `ArticleGenerationStep.tsx` - Step 4 generation interface
8. `EmptyStateDisplay.tsx` - Right panel empty state
9. `TitleGenerationControls.tsx` - Number selector and generate button
10. `OutlineEditor.tsx` - Drag-and-drop outline interface
11. `EnhancedNovelEditor.tsx` - Novel editor with streaming capabilities

### Enhanced Hooks:
1. `useArticleStudioWorkflow.ts` - Manage 4-step state machine
2. `useStreamingGeneration.ts` - Handle section-by-section generation with Firecrawl
3. `useSEOConfiguration.ts` - Manage SEO pro mode settings with persistence
4. `useOutlineManagement.ts` - Handle outline CRUD operations

### API Integration:
1. **Title Generation**: Existing `generate-titles` function (enhance with SEO params)
2. **Outline Generation**: Existing `generate-outline` function (enhance with more detail)
3. **Article Generation**: Enhance `generate-content` function for section-by-section streaming
4. **Web Research**: New Firecrawl integration for section research
5. **SEO Settings**: Database storage for user preferences

## Novel Editor Streaming Implementation

### Requirements:
- Use existing `NovelEditor` component from `src/components/NovelEditor.tsx`
- Implement real-time streaming content updates without blocking user edits
- Maintain full WYSIWYG editing capabilities during generation
- Handle section-by-section content insertion with progress indicators

### Implementation Strategy:
1. **JSON Content Structure**: Use editor's JSON format for precise content placement
2. **Transaction-based Updates**: Insert content using editor transactions
3. **Progress Indicators**: Show search/generation status within editor
4. **Conflict Resolution**: Handle simultaneous user edits and AI content insertion
5. **AI Feature Integration**: Leverage Novel's slash commands and bubble menu

### Web Search Integration Flow:
1. **Section Analysis**: Analyze outline section for research needs
2. **Firecrawl Search**: Search for latest information on section topic
3. **Content Synthesis**: Generate section content based on research
4. **Streaming Insertion**: Insert content into specific editor positions
5. **User Notification**: Show "Researching [topic]..." indicators

## Data Flow & State Management

### Enhanced State Structure:
```typescript
interface ArticleStudioState {
  currentStep: 1 | 2 | 3 | 4;
  topic: string;
  seoProMode: boolean;
  seoSettings: {
    targetAudience: string;
    keywords: string[];
    tone: string;
    length: string;
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
    researchPhase: 'idle' | 'searching' | 'generating' | 'complete';
  };
  articleContent: JSONContent; // Novel editor format
  simultaneousEditing: boolean;
}
```

### Database Schema Requirements:
```sql
-- SEO Settings table for persistence
CREATE TABLE user_seo_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  target_audience TEXT,
  preferred_keywords TEXT[],
  default_tone TEXT,
  default_length TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Phases

### Phase 1: Layout & Step 1 (Title Input) - PRIORITY
- Implement new layout structure with resizable panels
- Create title input form with SEO Pro mode toggle
- Add example topics functionality
- Implement empty state
- Set up SEO settings persistence

### Phase 2: Title Generation & Selection (Step 2)
- Enhance title generation with SEO parameters
- Implement title selection interface with auto-selection
- Add custom title option
- Integrate Firecrawl for title research (if applicable)

### Phase 3: Outline Creation (Step 3)
- Build outline editor with drag-and-drop
- Implement outline generation and management
- Add section estimation features
- Create outline preview interface

### Phase 4: Article Generation (Step 4)
- Integrate Enhanced Novel editor with streaming
- Implement Firecrawl research for each section
- Add real-time content generation with progress tracking
- Enable simultaneous editing capabilities
- Add section-by-section generation pipeline

### Phase 5: Polish & Enhancement
- Add animations and transitions
- Implement comprehensive error handling
- Add accessibility features
- Performance optimization
- User testing and refinement

## Firecrawl Integration Details

### Setup Requirements:
- Firecrawl API key configuration
- Rate limiting and error handling
- Search query optimization for article sections

### Research Flow per Section:
1. **Query Generation**: Create search query based on section title and context
2. **Firecrawl Search**: Execute web search for latest information
3. **Content Extraction**: Process and summarize research results
4. **AI Generation**: Generate section content using research data
5. **Editor Insertion**: Stream content into Novel editor at specific position

### Search Query Strategy:
- Section title + article context
- Include target keywords when relevant
- Focus on recent, authoritative sources
- Limit search scope to avoid information overload

## Technical Dependencies

### New Dependencies Needed:
- Firecrawl API integration
- Enhanced drag-and-drop library (if current implementation insufficient)

### Database Modifications:
- User SEO preferences table
- Article generation session tracking
- Research cache for performance optimization

## Success Metrics & Goals

1. **User Experience**: Seamless workflow completion in under 5 minutes
2. **Content Quality**: Research-backed sections with up-to-date information
3. **Editor Performance**: Smooth simultaneous editing during content generation
4. **SEO Optimization**: Automatic keyword integration and optimization
5. **User Retention**: Saved preferences leading to faster subsequent usage

## Risk Mitigation

1. **Firecrawl API Limitations**: Implement fallback to raw OpenAI if search fails
2. **Editor Conflicts**: Robust conflict resolution for simultaneous editing
3. **Generation Performance**: Progressive enhancement and caching strategies
4. **User Adoption**: Comprehensive onboarding and help documentation
5. **Content Accuracy**: Source attribution and fact-checking reminders

This comprehensive plan addresses all requirements for a modern, AI-powered article creation workflow with real-time collaboration capabilities and research-backed content generation.
