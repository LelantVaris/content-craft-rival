
# Article Studio Implementation Tracker

## Project Overview
**Goal**: Create a modern 4-step Article Studio with web research, simultaneous editing, and SEO optimization  
**Started**: 2025-01-26  
**Target MVP**: TBD  
**Current Phase**: Planning Complete ✅

## Key Decisions Made

### ✅ Web Search Integration
- **Choice**: Raw OpenAI (primary) with Tavily upgrade option
- **Reason**: Simplest MVP implementation, leverages existing API key
- **Implementation**: Two-phase generation per section (skeleton → web-enhanced)

### ✅ Content Generation Flow
- **Phase 1**: Generate skeleton outline and rough content without search
- **Phase 2**: Enhance each section with web search optimization
- **Progress Display**: Single line status updates that replace each other
- **Rate Limiting**: Standard retry with exponential backoff

### ✅ Novel Editor Approach
- **Choice**: Minimal integration with simultaneous editing enabled
- **Reason**: Keep existing functionality intact, leverage built-in AI features
- **Implementation**: Stream content using editor's transaction system

### ✅ SEO Data Persistence
- **Choice**: Save to database for user preferences
- **Reason**: Users can restart with saved settings
- **Implementation**: New `user_seo_preferences` table

### ✅ Example Topics
- **Focus Areas**: Marketing, B2B SaaS, Sales, Startups
- **Examples**: 
  - "How to reduce customer churn in B2B SaaS"
  - "Building a sales funnel for early-stage startups"
  - "Content marketing strategies for technical products"
  - "Pricing strategies for subscription businesses"

### ✅ Architecture
- **Layout**: 40/60 resizable panels using `react-resizable-panels`
- **Steps**: 4-step workflow (Title → Selection → Outline → Generation)
- **State**: Enhanced state management with simultaneous editing support

## Implementation Phases

### Phase 0: Layout Foundation Fix 🔄 NEXT
**Status**: Ready to Start  
**Priority**: Critical - Foundation for all other work

**Issue**: Current ArticleStudio layout doesn't integrate properly with SidebarInset, causing:
- Content constrained to max-width 1280px instead of full available space
- Layout conflicts with Shadcn sidebar pattern
- Responsive resizing not working correctly

**Layout Changes**:
- [ ] Update `ArticleStudio.tsx` to use `SidebarInset` pattern
- [ ] Remove custom full-screen layout wrapper
- [ ] Add proper header with `SidebarTrigger` and breadcrumbs
- [ ] Integrate with existing sidebar collapse/expand functionality
- [ ] Ensure content fills available space dynamically

**Expected Outcome**: Content area properly resizes when sidebar collapses/expands and fills full available width

### Phase 1: Database Setup & Core Layout 🔲 PENDING
**Status**: Awaiting Phase 0 completion  
**Database Changes**:
- [ ] Create `user_seo_preferences` table
- [ ] Update existing hooks for persistence

**Components to Create**:
- [ ] `ArticleStudioLayout.tsx` - Main resizable layout
- [ ] `StepProgress.tsx` - Progress indicator
- [ ] `TitleInputStep.tsx` - Step 1 form with example topics
- [ ] `SEOProModeToggle.tsx` - Collapsible SEO settings
- [ ] `EmptyStateDisplay.tsx` - Right panel empty state
- [ ] `TitleGenerationControls.tsx` - Generate button + counter

**Key Features**:
- [ ] Large topic input with "Try Example" button (Marketing/B2B/Sales/Startup topics)
- [ ] SEO Pro Mode toggle with collapsible sections
- [ ] Target audience, keywords, tone, length inputs
- [ ] Number selector for title count (3-10, default 5)
- [ ] Empty state with help link and custom title option

### Phase 2: Title Generation & Selection 🔲 PENDING
**Status**: Awaiting Phase 1 completion  
**Components to Create**:
- [ ] `TitleSelectionStep.tsx` - Title selection interface
- [ ] Enhanced `generate-titles` Edge Function with OpenAI

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

### Phase 4: Two-Phase Article Generation 🔲 PENDING
**Status**: Awaiting Phase 3 completion  
**Components to Create**:
- [ ] `ArticleGenerationStep.tsx` - Generation interface
- [ ] `ContentStreamingManager.tsx` - Two-phase generation orchestrator
- [ ] `ProgressStatusLine.tsx` - Single-line status updates
- [ ] Enhanced `generate-content` Edge Function

**Key Features**:
- [ ] **Phase 1**: Skeleton generation per section
- [ ] **Phase 2**: Web search enhancement per section
- [ ] Progress status: "Generating outline..." → "Enhancing with web research..." → "Finalizing content..."
- [ ] Real-time content streaming into Novel editor
- [ ] Simultaneous editing capabilities
- [ ] Rate limiting with exponential backoff

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
- [ ] `useArticleStudioWorkflow.ts` - 4-step state machine with SEO persistence
- [ ] `useTwoPhaseGeneration.ts` - Skeleton → Enhanced content generation
- [ ] `useSEOConfiguration.ts` - SEO settings with database persistence
- [ ] `useOutlineManagement.ts` - Outline CRUD operations
- [ ] `useProgressStatus.ts` - Single-line status management

### API Integration Tasks
- [ ] Enhance `generate-titles` with SEO parameters and OpenAI
- [ ] Enhance `generate-outline` with detailed structure
- [ ] Create `generate-content` with two-phase generation:
  - Phase 1: Skeleton content generation
  - Phase 2: Web search enhancement per section
- [ ] Implement section-by-section generation pipeline
- [ ] Add rate limiting and retry logic

### Novel Editor Integration Strategy
- [ ] Minimal changes to existing `NovelEditor.tsx`
- [ ] Use editor's transaction system for content streaming
- [ ] Preserve all existing AI features and functionality
- [ ] Add progress indicators within editor content
- [ ] Handle simultaneous user edits during generation

### Database Schema
- [ ] Create `user_seo_preferences` table with columns:
  - `user_id`, `target_audience`, `preferred_keywords[]`, `default_tone`, `default_length`
- [ ] Add indices for performance
- [ ] Set up RLS policies
- [ ] Create migration scripts

## Content Generation Flow Details

### Two-Phase Generation Process
1. **Skeleton Phase**: Generate basic content structure without web search
2. **Enhancement Phase**: Research and enhance each section with web data
3. **Progress Updates**: Single line that updates in real-time

### Example Progress Messages
- "Generating article outline..."
- "Writing introduction..."
- "Researching latest trends for 'Customer Retention'..."
- "Enhancing section with industry insights..."
- "Finalizing content..."

### Rate Limiting Strategy
- Exponential backoff: 1s, 2s, 4s, 8s delays
- Maximum 3 retries per API call
- Queue management for multiple sections
- Graceful degradation to skeleton content if enhancement fails

## Current Codebase Status

### ✅ Existing Components (Available)
- `useArticleStudio.ts` - Current hook (needs major restructure)
- `NovelEditor.tsx` - WYSIWYG editor component (minimal changes needed)
- `react-resizable-panels` - Layout system
- Edge functions: `generate-titles`, `generate-outline`, `generate-content`

### 🔄 Components Needing Updates
- `useArticleStudio.ts` → `useArticleStudioWorkflow.ts` (major restructure)
- `generate-content` → Enhanced with two-phase generation
- Article Studio main page → Complete redesign

### 🆕 Components to Create
See individual phase checklists above

## Example Topics for "Try Example" Button

### Marketing Focus
- "Content marketing strategies for B2B SaaS companies"
- "Building brand awareness for early-stage startups"
- "Email marketing automation for customer retention"

### B2B SaaS Focus
- "Reducing churn in subscription-based businesses"
- "Pricing strategies for SaaS products"
- "Onboarding best practices for enterprise software"

### Sales Focus
- "Building an effective sales funnel for B2B services"
- "Sales enablement tools for remote teams"
- "Lead qualification strategies for high-value prospects"

### Startup Focus
- "Fundraising strategies for pre-seed startups"
- "Building MVPs that validate product-market fit"
- "Scaling customer support for growing startups"

## Questions & Decisions Log

### ✅ Resolved
1. **Web Search Provider**: Raw OpenAI for MVP (upgrade to Tavily optional)
2. **Content Generation**: Two-phase approach (skeleton → enhanced)
3. **Progress Display**: Single line updates that replace each other
4. **Novel Editor**: Minimal integration, preserve existing functionality
5. **SEO Persistence**: Database storage for user preferences
6. **Example Topics**: Marketing/B2B/Sales/Startup focused examples
7. **Layout Structure**: 40/60 resizable panels
8. **Layout Foundation**: Fix SidebarInset integration as Phase 0

### ❓ Pending Decisions
1. **Database Migration Timing**: When should we create the SEO preferences table?
2. **Error Recovery**: How should we handle partial generation failures?
3. **Content Versioning**: Should we implement undo/redo for generated content?

## Next Steps

1. **Immediate**: Fix layout foundation (Phase 0) - Update ArticleStudio.tsx to properly integrate with SidebarInset
2. **Phase 1**: Create database schema for SEO preferences
3. **User Input Needed**: Approval for database schema
4. **Technical Setup**: Ensure OpenAI API credentials are configured

## Success Criteria

### Phase 0 Success Metrics
- [ ] Content area fills full available width
- [ ] Sidebar collapse/expand properly resizes content
- [ ] Header with SidebarTrigger and breadcrumbs implemented
- [ ] No layout conflicts with existing sidebar

### Phase 1 Success Metrics
- [ ] Working resizable layout (40/60)
- [ ] Complete title input form with SEO Pro mode
- [ ] Example topics functionality (Marketing/B2B/Sales/Startup)
- [ ] SEO settings persistence
- [ ] Empty state display

### Overall MVP Success Metrics
- [ ] Complete 4-step workflow
- [ ] Two-phase content generation with web research
- [ ] Simultaneous editing during generation
- [ ] SEO settings saved and restored
- [ ] Performance: Article generation under 2 minutes
- [ ] User Experience: Intuitive workflow completion

---

**Last Updated**: 2025-01-26  
**Next Review**: After Phase 0 layout fix completion  
**Status**: 📋 Planning Complete - Ready for Layout Foundation Fix
