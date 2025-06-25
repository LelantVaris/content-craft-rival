
# Article Studio Implementation Tracker

## Project Overview
**Goal**: Create a modern 4-step Article Studio with web research, simultaneous editing, and SEO optimization  
**Started**: 2025-01-26  
**Target MVP**: TBD  
**Current Phase**: Planning Complete ✅

## Key Decisions Made

### ✅ Web Search Integration
- **Choice**: Firecrawl (primary) with OpenAI fallback
- **Reason**: User preference for simplest MVP implementation
- **Implementation**: Each outline section gets dedicated research

### ✅ Novel Editor Approach
- **Choice**: Simultaneous editing enabled during content generation
- **Reason**: Leverages Novel's built-in AI features for enhanced UX
- **Implementation**: JSON content structure with transaction-based updates

### ✅ SEO Data Persistence
- **Choice**: Save to database for user preferences
- **Reason**: Users can restart with saved settings
- **Implementation**: New `user_seo_preferences` table

### ✅ Architecture
- **Layout**: 40/60 resizable panels using `react-resizable-panels`
- **Steps**: 4-step workflow (Title → Selection → Outline → Generation)
- **State**: Enhanced state management with simultaneous editing support

## Implementation Phases

### Phase 1: Layout & Step 1 (Title Input) 🔄 NEXT
**Status**: Ready to Start  
**Components to Create**:
- [ ] `ArticleStudioLayout.tsx` - Main resizable layout
- [ ] `StepProgress.tsx` - Progress indicator
- [ ] `TitleInputStep.tsx` - Step 1 form
- [ ] `SEOProModeToggle.tsx` - Collapsible SEO settings
- [ ] `EmptyStateDisplay.tsx` - Right panel empty state
- [ ] `TitleGenerationControls.tsx` - Generate button + counter

**Database Changes**:
- [ ] Create `user_seo_preferences` table
- [ ] Update `useSEOConfiguration` hook for persistence

**Key Features**:
- [ ] Large topic input with "Try Example" button
- [ ] SEO Pro Mode toggle with collapsible sections
- [ ] Target audience, keywords, tone, length inputs
- [ ] Number selector for title count (3-10, default 5)
- [ ] Empty state with help link and custom title option

### Phase 2: Title Generation & Selection 🔲 PENDING
**Status**: Awaiting Phase 1 completion  
**Components to Create**:
- [ ] `TitleSelectionStep.tsx` - Title selection interface
- [ ] Enhanced `generate-titles` Edge Function

**Key Features**:
- [ ] Title generation with SEO parameters
- [ ] Auto-select first generated title
- [ ] Custom title fallback option
- [ ] Regeneration capability

### Phase 3: Outline Creation 🔲 PENDING
**Status**: Awaiting Phase 2 completion  
**Components to Create**:
- [ ] `OutlineCreationStep.tsx` - Outline builder
- [ ] `OutlineEditor.tsx` - Drag-and-drop interface
- [ ] Enhanced `generate-outline` Edge Function

**Key Features**:
- [ ] Hierarchical outline display
- [ ] Add/remove headlines and sub-headlines
- [ ] Drag-and-drop reordering
- [ ] Character count estimates per section

### Phase 4: Article Generation 🔲 PENDING
**Status**: Awaiting Phase 3 completion  
**Components to Create**:
- [ ] `ArticleGenerationStep.tsx` - Generation interface
- [ ] `EnhancedNovelEditor.tsx` - Streaming-capable editor
- [ ] Firecrawl integration service
- [ ] Enhanced `generate-content` Edge Function

**Key Features**:
- [ ] Section-by-section web research with Firecrawl
- [ ] Real-time content streaming into Novel editor
- [ ] Simultaneous editing capabilities
- [ ] Progress indicators for research and generation
- [ ] "Searching with Firecrawl..." status updates

### Phase 5: Polish & Enhancement 🔲 PENDING
**Status**: Awaiting Phase 4 completion  
**Tasks**:
- [ ] Animations and transitions
- [ ] Comprehensive error handling
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] User testing and refinement

## Technical Requirements Checklist

### New Hooks to Create
- [ ] `useArticleStudioWorkflow.ts` - 4-step state machine
- [ ] `useStreamingGeneration.ts` - Section-by-section generation
- [ ] `useSEOConfiguration.ts` - SEO settings with persistence
- [ ] `useOutlineManagement.ts` - Outline CRUD operations

### API Integration Tasks
- [ ] Enhance `generate-titles` with SEO parameters
- [ ] Enhance `generate-outline` with detailed structure
- [ ] Enhance `generate-content` for streaming
- [ ] Create Firecrawl integration service
- [ ] Implement section research pipeline

### Database Schema
- [ ] Create `user_seo_preferences` table
- [ ] Add indices for performance
- [ ] Set up RLS policies
- [ ] Create migration scripts

## Current Codebase Status

### ✅ Existing Components (Available)
- `useArticleStudio.ts` - Current hook (needs major restructure)
- `NovelEditor.tsx` - WYSIWYG editor component
- `react-resizable-panels` - Layout system
- Edge functions: `generate-titles`, `generate-outline`, `generate-content`

### 🔄 Components Needing Updates
- `useArticleStudio.ts` → `useArticleStudioWorkflow.ts` (major restructure)
- `generate-content` → Enhanced with Firecrawl integration
- Article Studio main page → Complete redesign

### 🆕 Components to Create
See individual phase checklists above

## Questions & Decisions Log

### ✅ Resolved
1. **Web Search Provider**: Firecrawl (user preference)
2. **Simultaneous Editing**: Enabled (leverages Novel AI features)
3. **SEO Persistence**: Database storage (user preference)
4. **Layout Structure**: 40/60 resizable panels

### ❓ Pending Decisions
1. **Example Topics**: What specific examples should "Try Example" button cycle through?
2. **Error Handling Granularity**: Section-level retry vs full regeneration?
3. **Firecrawl Rate Limits**: How to handle API limits gracefully?
4. **Content Versioning**: Should we implement undo/redo for generated content?

## Next Steps

1. **Immediate**: Start Phase 1 implementation
2. **User Input Needed**: Example topics for "Try Example" button
3. **Technical Setup**: Configure Firecrawl API credentials
4. **Database**: Create SEO preferences schema

## Success Criteria

### Phase 1 Success Metrics
- [ ] Working resizable layout (40/60)
- [ ] Complete title input form with SEO Pro mode
- [ ] Example topics functionality
- [ ] SEO settings persistence
- [ ] Empty state display

### Overall MVP Success Metrics
- [ ] Complete 4-step workflow
- [ ] Web research integration for each section
- [ ] Simultaneous editing during generation
- [ ] SEO settings saved and restored
- [ ] Performance: Article generation under 2 minutes
- [ ] User Experience: Intuitive workflow completion

---

**Last Updated**: 2025-01-26  
**Next Review**: After Phase 1 completion  
**Status**: 📋 Planning Complete - Ready for Implementation
