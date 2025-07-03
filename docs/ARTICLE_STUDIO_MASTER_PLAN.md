
# Article Studio Master Plan

## Project Overview
**Goal**: Create a modern 3-step Article Studio with web research, simultaneous editing, and SEO optimization  
**Current Status**: ✅ Phase 2 Complete → 🔄 Phase 3 (AI SDK Implementation) → Phase 1 UI Fixes  
**Target**: Complete MVP with clean UI, real-time streaming and enhanced UX

## Strategic Vision

### Core Experience ✅ FOUNDATION COMPLETE
Transform article creation from a basic form-based approach to an AI-powered, interactive experience with:
- [x] **3-Step Workflow**: Title → Outline → Article Generation ✅ IMPLEMENTED
- [x] **Clean Dual-Panel Layout**: 40/60 resizable panels without headers or visual separators ✅ COMPLETED
- [x] **Progressive Content Display**: Empty states, title selection, outline creation, article preview ✅ IMPLEMENTED
- [x] **Conditional Statistics**: Stats/SEO/Publishing shown only when relevant ✅ COMPLETED
- [ ] **Real-time Streaming**: Section-by-section content generation with progress indicators 🔄 IN PROGRESS
- [ ] **Simultaneous Editing**: Users can edit while content streams using Novel WYSIWYG editor
- [ ] **Web Research Integration**: Enhanced content quality through automated research
- [x] **SEO Optimization**: Built-in SEO scoring and keyword optimization ✅ FOUNDATION READY

### Key Design Principles ✅ COMPLETED
- [x] **Clean Interface**: Removed panel headers and visual noise ✅ COMPLETED
- [x] **Conditional Display**: Hide irrelevant information until needed ✅ COMPLETED
- [x] **Progressive Disclosure**: Each step reveals appropriate content ✅ IMPLEMENTED
- [ ] **Real-time Feedback**: Live preview and streaming content generation 🔄 NEXT PRIORITY
- [ ] **User Control**: Ability to edit, customize, and override AI suggestions
- [ ] **Quality Focus**: Research-backed content with SEO optimization

## Technical Architecture Decisions

### ✅ Finalized Technical Choices - IMPLEMENTED

#### Layout & UI Framework ✅ ALL COMPLETED
- [x] **Layout**: 40/60 resizable panels using `react-resizable-panels` → `src/pages/ArticleStudio.tsx`
- [x] **Left Panel**: Step-based controls and forms (40% width) → `src/components/ArticleStudio/UnifiedControlPanel.tsx`
- [x] **Right Panel**: Dynamic content preview area (60% width) → `src/components/ArticleStudio/LivePreviewPanel.tsx`
- [x] **Headers**: Removed "Control Panel" and "Live Preview" headers for clean interface ✅ COMPLETED
- [x] **Visual Separators**: No visual separator between panels, hidden resizable handle by default ✅ COMPLETED
- [x] **Conditional Display**: Stats, SEO, and Publishing options shown only when relevant ✅ COMPLETED
- [ ] **Editor**: Novel WYSIWYG with simultaneous editing capabilities → `src/components/NovelEditor.tsx` (EXISTS)
- [x] **Foundation**: Fixed SidebarInset integration ✅ COMPLETED

#### Content Generation Strategy 🔄 HYBRID APPROACH DECIDED
**Current Decision**: Hybrid approach for optimal performance and user experience

**✅ Keep Direct API Calls** (Speed Critical):
- [x] **Title Generation**: `supabase/functions/generate-titles/index.ts` - Fast response needed
- [x] **Outline Generation**: `supabase/functions/generate-outline/index.ts` - Quick structure creation
- [x] **Keyword Generation**: `supabase/functions/generate-keywords/index.ts` - Instant suggestions

**🔄 Convert to AI SDK** (User Experience Critical):
- [ ] **Article Content**: `supabase/functions/generate-content-ai-sdk/index.ts` - Real-time streaming
- [ ] **Frontend Integration**: `src/components/ArticleStudio/ContentGenerationPanel.tsx` - Use AI SDK hooks
- [ ] **Novel Editor Streaming**: `src/components/NovelEditor.tsx` - Real-time content insertion

#### Streaming Implementation Plan 🔄 IN PROGRESS
- [ ] **Phase 1**: Fix AI SDK in `generate-content-ai-sdk` function
  - [ ] Replace CDN imports causing 429 errors
  - [ ] Implement `streamText()` from AI SDK
  - [ ] Maintain PVOD prompt structure
- [ ] **Phase 2**: Frontend streaming integration
  - [ ] Use `useChat` or `useCompletion` from AI SDK
  - [ ] Connect to Novel Editor for real-time insertion
  - [ ] Add progress indicators and status updates

#### AI Integration Architecture ✅ FOUNDATION + 🔄 STREAMING
- [x] **Basic Generation**: All edge functions working with OpenAI ✅ COMPLETED
- [x] **Error Handling**: Comprehensive error recovery implemented ✅ COMPLETED
- [x] **Type Safety**: TypeScript coverage across all components ✅ COMPLETED
- [ ] **AI SDK Migration**: Streaming implementation for article generation 🔄 PRIORITY
- [ ] **Streaming Reliability**: Real-time content generation without errors

#### Database & Persistence ✅ COMPLETED
- [x] **SEO Settings**: Save to `user_seo_preferences` table for user preferences ✅ COMPLETED
- [x] **Session Management**: Maintain settings across sessions ✅ COMPLETED
- [x] **Article Storage**: Enhanced with scheduling and calendar integration ✅ READY

## Component Architecture & References

### Core Article Studio Components ✅ IMPLEMENTED
| Component | File Path | Status | Responsibility | Next Action |
|-----------|-----------|--------|---------------|-------------|
| **Article Studio** | `src/pages/ArticleStudio.tsx` | ✅ Complete | Main layout, panels, header | No changes |
| **Unified Control Panel** | `src/components/ArticleStudio/UnifiedControlPanel.tsx` | ✅ Working | Left panel step management | No changes |
| **Live Preview Panel** | `src/components/ArticleStudio/LivePreviewPanel.tsx` | ✅ Complete | Right panel progressive content | No changes |
| **Step Navigation** | `src/components/ArticleStudio/StepNavigation.tsx` | ✅ Complete | 3-step workflow navigation | No changes |

### Generation Components 🔄 MIXED STATUS
| Component | File Path | Status | API Type | Next Action |
|-----------|-----------|--------|----------|-------------|
| **Title Generation** | `src/components/ArticleStudio/TitleGenerationPanel.tsx` | ✅ Keep | Direct OpenAI | No changes needed |
| **Outline Creation** | `src/components/ArticleStudio/OutlineCreationPanel.tsx` | ✅ Keep | Direct OpenAI | No changes needed |
| **Content Generation** | `src/components/ArticleStudio/ContentGenerationPanel.tsx` | 🔄 Update | **Convert to AI SDK** | **PRIORITY TASK** |

### UI & Experience Components ✅ COMPLETED
| Component | File Path | Status | Purpose | Integration |
|-----------|-----------|--------|---------|-------------|
| **Empty State Display** | `src/components/ArticleStudio/EmptyStateDisplay.tsx` | ✅ Complete | No content state with try example | Working perfectly |
| **Streaming Preview** | `src/components/ArticleStudio/StreamingArticlePreview.tsx` | 🔄 Update | Display streaming content | Needs AI SDK integration |
| **Loading Skeleton** | `src/components/ArticleStudio/AnimatedLoadingSkeleton.tsx` | ✅ Working | Loading states between steps | No changes needed |
| **Live Article Stats** | `src/components/ArticleStudio/LiveArticleStats.tsx` | ✅ Working | Conditional statistics display | Working perfectly |

### Editor Integration 🔄 READY FOR STREAMING
| Component | File Path | Status | Capability | Next Integration |
|-----------|-----------|--------|------------|------------------|
| **Novel Editor** | `src/components/NovelEditor.tsx` | ✅ Existing | Full WYSIWYG editing | **Connect AI SDK streaming** |
| **Content Editor** | `src/components/ArticleEditor/ContentEditor.tsx` | ✅ Existing | Article editing interface | Already integrated |

## 3-Step Workflow Implementation Status

### ✅ Step 1: Title Input & Configuration - COMPLETED
**Left Panel** (`src/components/ArticleStudio/UnifiedControlPanel.tsx`):
- [x] Large topic input field with "Write an article about..." prompt ✅
- [x] "Try Example" button (random topics, no dropdown) ✅ 
- [x] SEO Pro Mode toggle with inline sections ✅:
  - [x] Target Audience (text input) ✅
  - [x] Keywords (text input with tag functionality) ✅
  - [x] Tone (select dropdown: Professional, Casual, Technical) ✅
  - [x] Length (select dropdown: Short 500-800, Medium 800-1500, Long 1500+) ✅

**Right Panel** (`src/components/ArticleStudio/LivePreviewPanel.tsx`):
- [x] Empty state with search icon in rounded square ✅
- [x] Copy: "No titles generated" + descriptive text ✅
- [x] Title generation integration ✅
- [x] "Write my own title" fallback option ✅

### ✅ Step 2: Title Selection & Outline Creation - COMPLETED
**Left Panel**: 
- [x] Form in review mode with edit capability ✅
- [x] Outline management controls ✅

**Right Panel**: 
- [x] Generated titles in selectable cards with auto-selection ✅
- [x] Outline preview with structured display ✅
- [x] Loading states between steps ✅

### 🔄 Step 3: Article Generation - NEEDS AI SDK STREAMING
**Left Panel**: 
- [x] Generation progress tracking and controls ✅
- [x] Step completion indicators ✅

**Right Panel**: 
- [x] Novel editor integration ready ✅
- [ ] **PRIORITY**: Real-time streaming implementation 🔄
- [x] Conditional display of statistics after generation complete ✅:
  - [x] Word count, read time, SEO score (shown when content >500 chars) ✅
  - [x] Keywords analysis, structure analysis (shown when content >1000 chars) ✅
  - [x] Readiness percentage (shown when content >800 chars with title) ✅
- [x] SEO analysis panel (shown after substantial content) ✅
- [x] Publishing options (shown when article is ready) ✅
- [x] Article length matching target length setting ✅

## Implementation Phases - Updated Status

### ✅ Phase 0: Layout Foundation - COMPLETED
- [x] Fixed SidebarInset integration for proper content resizing
- [x] Content area fills full available width dynamically
- [x] Header with SidebarTrigger and breadcrumbs implemented

### ✅ Phase 1: Database Setup & Core Layout - COMPLETED
- [x] Create `user_seo_preferences` table with RLS policies
- [x] Implement resizable 40/60 panel layout
- [x] Remove panel headers for clean interface
- [x] Set up conditional display architecture

### ✅ Phase 2: Clean UI Implementation - COMPLETED
**Goal**: Implement clean, progressive interface with reference design matching
- [x] Remove visual separators and hide resizable handle by default ✅ COMPLETED
- [x] Conditional statistics display implementation ✅ COMPLETED
- [x] Create empty state display with search icon illustration ✅ COMPLETED
- [x] Update messaging: "No titles generated" with descriptive copy ✅ COMPLETED
- [x] Add "Try example" button with random topics (no dropdown) ✅ COMPLETED
- [x] Update step labels to "Title", "Outline", "Article" (keep descriptions) ✅ COMPLETED
- [x] Implement loading screen overlays between steps ✅ COMPLETED
- [x] Ensure article length matches target setting ✅ COMPLETED
- [x] Match color schema from reference screenshots ✅ COMPLETED

### 🔄 Phase 3: AI SDK Migration - IN PROGRESS (CRITICAL PRIORITY)
**Goal**: Implement real-time streaming for article generation
**Current Status**: Planning complete, implementation needed

#### Immediate Tasks (Priority Order):
1. **[ ] Fix AI SDK Edge Function** (`supabase/functions/generate-content-ai-sdk/index.ts`)
   - [ ] Replace problematic CDN import with stable alternative
   - [ ] Implement `streamText()` from AI SDK
   - [ ] Test streaming reliability and error handling
   - [ ] Maintain existing PVOD prompt structure

2. **[ ] Update Frontend Integration** (`src/components/ArticleStudio/ContentGenerationPanel.tsx`)
   - [ ] Replace manual streaming with AI SDK hooks (`useChat` or `useCompletion`)
   - [ ] Connect streaming output to Novel Editor
   - [ ] Add real-time progress indicators
   - [ ] Preserve existing error handling and UX

3. **[ ] Novel Editor Streaming** (`src/components/NovelEditor.tsx`)
   - [ ] Implement real-time content insertion during streaming
   - [ ] Maintain editor state and formatting during updates
   - [ ] Preserve all existing Novel Editor features
   - [ ] Add streaming status indicators

#### Success criteria for Phase 3:
- [ ] Zero React Error #31 occurrences
- [ ] 99%+ successful streaming completion rate  
- [ ] Real-time content appears in Novel Editor
- [ ] Seamless integration with existing 3-step workflow

### 📋 Phase 4: Enhanced Content Generation - PENDING
**Goal**: Two-phase generation with web research
**Dependencies**: Phase 3 complete
- [ ] Implement skeleton → enhanced content pipeline
- [ ] Add web search integration per section
- [ ] Create section-by-section streaming with progress indicators
- [ ] Enable simultaneous editing during generation

### 📋 Phase 5: Advanced Features & Polish - PENDING
**Goal**: Production-ready experience
**Dependencies**: Phase 4 complete
- [ ] Complete outline creation with drag-and-drop
- [ ] Add comprehensive SEO optimization
- [ ] Implement publishing and export capabilities
- [ ] Performance optimization and comprehensive testing

## Example Topics Strategy ✅ IMPLEMENTED

**Current Implementation** (`src/utils/exampleTopics.ts`):
- [x] Random selection with no dropdown needed ✅
- [x] Single pool of general example topics ✅
- [x] Simple random example topics functionality ✅

**Working Examples**:
- [x] "How to reduce customer churn in B2B SaaS" ✅
- [x] "Building a sales funnel for early-stage startups" ✅
- [x] "Content marketing strategies for technical products" ✅
- [x] "Pricing strategies for subscription businesses" ✅

## Success Metrics & Goals

### Technical Performance Targets
- [ ] **Streaming Reliability**: 99%+ successful completion rate
- [ ] **Generation Speed**: Complete article in <2 minutes
- [ ] **Error Rate**: <1% React errors, <5% API failures
- [ ] **User Experience**: Seamless workflow completion in <5 minutes

### Content Quality Targets
- [x] **SEO Foundation**: Automatic keyword integration and scoring setup ✅
- [ ] **Research Integration**: Up-to-date, research-backed content
- [ ] **User Satisfaction**: Minimal editing required post-generation
- [ ] **Variety**: Diverse, non-repetitive content suggestions
- [x] **Length Accuracy**: Generated articles match target length settings ✅

### User Adoption Targets
- [x] **Workflow Foundation**: 3-step process implemented and functional ✅
- [x] **Interface Design**: Clean, professional interface matching specifications ✅
- [ ] **Feature Usage**: >85% SEO Pro mode adoption
- [ ] **Time Savings**: 70% reduction in article creation time
- [ ] **Return Usage**: Saved preferences leading to faster subsequent use

## Risk Mitigation Strategy

### Technical Risks & Mitigation
- [x] **Layout Issues**: Resolved through careful SidebarInset integration ✅
- [ ] **Streaming Failures**: AI SDK provides robust error recovery (implementing)
- [ ] **Performance Issues**: Progressive enhancement and caching (planned)
- [ ] **Editor Conflicts**: Transaction-based updates for simultaneous editing (planned)
- [x] **API Limitations**: Hybrid approach balances speed and features ✅

### User Experience Risks & Mitigation
- [x] **Learning Curve**: Clean 3-step interface reduces complexity ✅
- [x] **Feature Overload**: Progressive disclosure implemented ✅
- [x] **Content Quality**: Preview and editing capabilities throughout process ✅
- [x] **Mobile Experience**: Desktop-first approach with proper messaging ✅

## Current Blocking Issues & Resolution Plan

### 🚨 Phase 3 Critical Blockers
1. **AI SDK Integration**: 
   - **Issue**: Need to implement streaming for `generate-content-ai-sdk`
   - **Solution**: Replace CDN imports, implement `streamText()`
   - **Timeline**: 2-3 hours

2. **Frontend Streaming Integration**:
   - **Issue**: Connect AI SDK to existing UI components
   - **Solution**: Update `ContentGenerationPanel.tsx` with AI SDK hooks
   - **Timeline**: 2-3 hours

3. **Novel Editor Connection**:
   - **Issue**: Stream content directly into Novel Editor
   - **Solution**: Implement real-time content insertion
   - **Timeline**: 2-3 hours

### Immediate Next Steps (Priority Order)
1. **Implement AI SDK in edge function** - Fix streaming foundation
2. **Update ContentGenerationPanel** - Connect frontend to streaming
3. **Test Novel Editor integration** - Ensure content flows properly
4. **Performance validation** - Test streaming reliability and speed

## Future Roadmap

### Post-MVP Enhancements
- [ ] **Advanced AI Features**: Custom writing styles and brand voice
- [ ] **Collaboration**: Multi-user editing and review workflows
- [ ] **Analytics**: Content performance tracking and optimization
- [ ] **Integrations**: Enhanced CMS publishing and social media distribution
- [ ] **Enterprise Features**: Team management and approval workflows

### Platform Evolution
- [ ] **Mobile App**: Native mobile article creation experience
- [ ] **API Access**: Third-party integrations and automation
- [ ] **White Label**: Customizable interface for enterprise clients
- [ ] **Advanced Research**: Integration with premium research databases

---

**Last Updated**: 2025-07-03  
**Current Focus**: Phase 3 AI SDK Implementation for Streaming  
**Next Milestone**: Real-time article generation with Novel Editor integration  
**Document Version**: 3.0 - AI SDK Implementation Ready

This master plan serves as the strategic foundation for all Article Studio development, with clear checkpoints and component references for the current AI SDK implementation priority.
