
# Article Studio Redesign Implementation Plan

## Overview
Complete redesign of the Article Studio to implement a 4-step workflow with enhanced UX, SEO features, and real-time article generation using Novel WYSIWYG editor.

## Layout Architecture

### Main Layout (40/60 Resizable)
- **Left Panel (40%)**: Step-based controls and forms
- **Right Panel (60%)**: Dynamic content preview area
- **Technology**: Continue using `react-resizable-panels` for the resizable layout

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
  - Real-time streaming content display
  - Full editing capabilities during and after generation
  - Section-by-section generation with progress indicators

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
11. `RealTimeArticleEditor.tsx` - Novel editor with streaming

### Enhanced Hooks:
1. `useArticleStudioWorkflow.ts` - Manage 4-step state machine
2. `useStreamingGeneration.ts` - Handle section-by-section generation
3. `useSEOConfiguration.ts` - Manage SEO pro mode settings
4. `useOutlineManagement.ts` - Handle outline CRUD operations

### API Integration:
1. **Title Generation**: Existing `generate-titles` function (enhance with SEO params)
2. **Outline Generation**: Existing `generate-outline` function (enhance with more detail)
3. **Article Generation**: Enhance `generate-content` function for section-by-section streaming
4. **Section Research**: New function for individual section research/generation

## Novel Editor Integration

### Requirements:
- Use existing `NovelEditor` component from `src/components/NovelEditor.tsx`
- Implement real-time streaming content updates
- Maintain full WYSIWYG editing capabilities
- Handle section-by-section content insertion

### Implementation Details:
- Stream content directly into editor
- Use editor's JSON content structure for precise section placement
- Implement progress indicators within the editor interface

## Data Flow & State Management

### State Structure:
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
  };
  titleCount: number;
  generatedTitles: string[];
  selectedTitle: string;
  outline: OutlineSection[];
  generationProgress: {
    currentSection: number;
    isGenerating: boolean;
    sectionStatus: SectionStatus[];
  };
  articleContent: string;
}
```

## Key Questions for Decision Making:

### 1. Title Generation Enhancement:
- Should we modify the existing `generate-titles` function to accept SEO parameters?
- Do you want to store SEO settings in the database for future reference?

### 2. Outline Management:
- Should outline sections have character/word count targets?
- Do you want templates for common article structures (How-to, Listicle, etc.)?

### 3. Section-by-Section Generation:
- Should each section use a separate OpenAI call with specific research?
- Do you want to implement web search integration for section research?
- Should users be able to regenerate individual sections?

### 4. Novel Editor Integration:
- Should the editor be read-only during generation or allow simultaneous editing?
- Do you want to preserve editing history/versions?
- Should we implement auto-save during generation?

### 5. Error Handling & UX:
- How should we handle generation failures for individual sections?
- Should users be able to retry failed sections independently?
- Do you want offline draft saving capabilities?

### 6. Performance Considerations:
- Should we implement request queuing for large outlines?
- Do you want to add rate limiting for title generation requests?

## Implementation Phases:

### Phase 1: Layout & Step 1 (Title Input)
- Implement new layout structure
- Create title input form with SEO Pro mode
- Add example topics functionality
- Implement empty state

### Phase 2: Title Generation & Selection (Step 2)
- Enhance title generation with SEO parameters
- Implement title selection interface
- Add custom title option

### Phase 3: Outline Creation (Step 3)
- Build outline editor with drag-and-drop
- Implement outline generation and management
- Add section estimation features

### Phase 4: Article Generation (Step 4)
- Integrate Novel editor
- Implement streaming generation
- Add section-by-section progress tracking
- Implement research and generation pipeline

### Phase 5: Polish & Enhancement
- Add animations and transitions
- Implement comprehensive error handling
- Add accessibility features
- Performance optimization

## Dependencies & Considerations:

### Existing Components to Modify:
- `useArticleStudio.ts` hook (major restructure needed)
- Existing edge functions (enhance for new features)

### New Dependencies Needed:
- None (all required packages already installed)

### Database Schema Considerations:
- May need to store SEO settings and outline structures
- Consider adding generation progress tracking

## Questions Before Proceeding:

1. **Priority Features**: Which features are must-have vs. nice-to-have for the initial implementation?

2. **Section Research**: Do you want actual web search integration for section research, or should we focus on AI-generated content based on the outline?

3. **User Testing**: Should we implement analytics/tracking to understand user behavior in the new workflow?

4. **Backwards Compatibility**: Do we need to maintain any compatibility with the current Article Studio workflow?

5. **Content Limits**: What are the maximum limits for titles, outline sections, and article length?

Please review this plan and let me know:
- Which questions you'd like to address first
- Any modifications to the proposed approach
- Which phase you'd like to start with
- Any additional features or considerations I should include
