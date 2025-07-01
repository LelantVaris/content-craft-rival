
# Article Studio Implementation Plan

## Overview

This plan outlines the creation of a unified, single-page "Article Studio" that consolidates the article wizard and editor into one seamless interface. This will eliminate page navigation issues and create a streamlined article creation workflow.

## Current Issues
- Articles not appearing in "Recent Articles" sidebar after creation
- Editor showing "Loading article..." but content not displaying
- Navigation between wizard and editor causing data loss
- Auto-save creating unwanted "Untitled Article" entries
- Workflow requires multiple page navigations

## Proposed Solution: Unified Article Studio

### Layout Design
```
┌─────────────────────────────────────────────────────────┐
│                     Article Studio                      │
├───────────────────────┬─────────────────────────────────┤
│    Control Panel     │        Live Preview Panel       │
│      (Left 40%)      │          (Right 60%)           │
│                      │                                 │
│ ┌─ Title Generation  │ ┌─ Article Preview ────────────┐ │
│ │ ┌─ Input topic    │ │ │ # Generated Title           │ │
│ │ ├─ Keywords       │ │ │                             │ │
│ │ └─ Audience       │ │ │ ## Introduction             │ │
│ └─ Generate Titles   │ │ │ Content appears here as     │ │
│                      │ │ │ it's being generated...     │ │
│ ┌─ Outline Creation  │ │ │                             │ │
│ │ ┌─ Section 1      │ │ │ ## Main Content             │ │
│ │ ├─ Section 2      │ │ │ More content...             │ │
│ │ └─ Add Section    │ │ │                             │ │
│ └─ Generate Outline  │ │ └─────────────────────────────┘ │
│                      │                                 │
│ ┌─ Content Generate  │ ┌─ Real-time Stats ────────────┐ │
│ │ ┌─ Writing Style  │ │ │ Words: 847 | Reading: 3 min │ │
│ │ ├─ Tone           │ │ │ SEO Score: 78/100           │ │
│ │ └─ Advanced Opts  │ │ └─────────────────────────────┘ │
│ └─ Generate Content  │                                 │
│                      │ ┌─ Publishing Options ─────────┐ │
│ ┌─ Knowledge Base    │ │ │ ☐ Publish to Blog          │ │
│ │ ┌─ Upload Docs    │ │ │ ☐ Schedule for later        │ │
│ │ └─ Reference Libs │ │ │ ☐ Export as draft          │ │
│ └─ Manage Sources    │ │ └─────────────────────────────┘ │
└──────────────────────┴─────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Core Structure (Week 1)
**Priority: HIGH**

#### 1.1 Create ArticleStudio Component
- **File**: `src/pages/ArticleStudio.tsx`
- Single-page component with resizable panels
- Left panel: Control interface (40% width)
- Right panel: Live preview (60% width)
- Use react-resizable-panels for adjustable layout

#### 1.2 Implement State Management
- **File**: `src/hooks/useArticleStudio.ts`
- Unified state for entire article creation process
- Real-time synchronization between panels
- Auto-save with smart content validation
- Prevent saving empty/meaningless articles

#### 1.3 Create Base Panel Components
- **File**: `src/components/ArticleStudio/ControlPanel.tsx`
- **File**: `src/components/ArticleStudio/PreviewPanel.tsx`
- **File**: `src/components/ArticleStudio/StepNavigation.tsx`
- Responsive design with proper spacing
- Step-by-step progression indicators

### Phase 2: Control Panel Features (Week 1-2)
**Priority: HIGH**

#### 2.1 Title Generation Interface
- **File**: `src/components/ArticleStudio/TitleGenerationPanel.tsx`
- Topic input with keyword suggestions
- Target audience selection
- Multiple AI-generated title options
- "Write my own" custom title option
- Real-time preview updates

#### 2.2 Outline Creation Interface
- **File**: `src/components/ArticleStudio/OutlineCreationPanel.tsx`
- Expandable section management
- Drag-and-drop reordering
- Character count per section
- Add/remove/edit sections
- Outline structure visualization

#### 2.3 Content Generation Interface
- **File**: `src/components/ArticleStudio/ContentGenerationPanel.tsx`
- Writing style and tone selection
- Advanced generation options
- Progress indicators with "Searching web..." messages
- Section-by-section generation
- Real-time content streaming

### Phase 3: Live Preview Panel (Week 2)
**Priority: HIGH**

#### 3.1 Article Preview Component
- **File**: `src/components/ArticleStudio/ArticlePreview.tsx`
- Live markdown rendering
- Real-time content updates as user types/generates
- Proper typography and formatting
- Mobile-responsive preview

#### 3.2 Real-time Statistics
- **File**: `src/components/ArticleStudio/ArticleStats.tsx`
- Live word count and reading time
- SEO score calculation and display
- Readability metrics
- Keyword density analysis

#### 3.3 Publishing Options
- **File**: `src/components/ArticleStudio/PublishingOptions.tsx`
- Save as draft functionality
- Publish to blog options
- Export capabilities
- Webflow integration controls

### Phase 4: Advanced Features (Week 3)
**Priority: MEDIUM**

#### 4.1 Knowledge Base Integration
- **File**: `src/components/ArticleStudio/KnowledgePanel.tsx`
- Document upload and reference
- Context-aware content suggestions
- Source attribution and citations
- Reference library management

#### 4.2 Real-time Content Streaming
- **File**: `src/services/contentStreaming.ts`
- WebSocket or SSE for live updates
- Progressive content generation
- Stream content directly to preview
- Handle connection interruptions

#### 4.3 Enhanced AI Integration
- **File**: `src/services/articleStudioAI.ts`
- Improved title generation algorithms
- Context-aware outline suggestions
- Smart content enhancement
- SEO optimization recommendations

### Phase 5: Integration & Polish (Week 4)
**Priority: MEDIUM**

#### 5.1 Navigation Updates
- Update routing to use ArticleStudio as primary interface
- Maintain backward compatibility for existing editor
- Handle deep-linking to specific articles
- Breadcrumb navigation

#### 5.2 Data Migration & Sync
- **File**: `src/services/articleStudioSync.ts`
- Seamless data flow between studio and database
- Handle existing article loading
- Prevent data loss during transitions
- Robust error recovery

#### 5.3 Performance Optimization
- **File**: `src/hooks/useOptimizedGeneration.ts`
- Debounced auto-save
- Efficient re-rendering
- Memory management for large articles
- Loading state optimizations

## File Structure

### New Directory Structure
```
src/pages/
├── ArticleStudio.tsx (New main component)

src/components/ArticleStudio/
├── ControlPanel.tsx
├── PreviewPanel.tsx
├── StepNavigation.tsx
├── TitleGenerationPanel.tsx
├── OutlineCreationPanel.tsx
├── ContentGenerationPanel.tsx
├── ArticlePreview.tsx
├── ArticleStats.tsx
├── PublishingOptions.tsx
├── KnowledgePanel.tsx
└── index.ts

src/hooks/
├── useArticleStudio.ts
├── useContentStreaming.ts
└── useOptimizedGeneration.ts

src/services/
├── contentStreaming.ts
├── articleStudioAI.ts
└── articleStudioSync.ts
```

## Workflow Experience

### Step 1: Topic & Title (Left Panel)
1. User enters topic and keywords
2. AI generates multiple title options
3. User selects preferred title or writes custom
4. Preview panel shows selected title immediately

### Step 2: Outline Creation (Left Panel)
1. AI generates initial outline based on title
2. User can expand/collapse sections
3. Add, remove, or reorder sections with drag-drop
4. Preview panel shows structured outline

### Step 3: Content Generation (Left Panel)
1. User selects writing style and tone
2. AI generates content section by section
3. Content streams live into preview panel
4. Real-time stats update (word count, SEO score)

### Step 4: Review & Publish (Right Panel)
1. Full article preview with proper formatting
2. Publishing options available
3. One-click save to drafts or publish
4. Export functionality

## Technical Requirements

### Dependencies to Add
- `react-resizable-panels` for layout
- Enhanced WebSocket/SSE for streaming
- Improved markdown rendering

### Performance Targets
- Initial load: < 2 seconds
- Content generation: < 30 seconds per section
- Real-time updates: < 200ms latency
- Auto-save: Every 10 seconds (when content changes)

### Success Metrics
- Eliminate "Loading article..." issues
- Reduce article creation time by 60%
- Increase completion rate to 90%
- Zero data loss during creation process

## Migration Strategy

### Phase 1: Parallel Development
- Build ArticleStudio alongside existing components
- Test thoroughly before switching

### Phase 2: Gradual Rollout
- Route new articles to ArticleStudio
- Maintain existing editor for editing saved articles
- Add "Open in Studio" option to existing articles

### Phase 3: Full Migration
- Make ArticleStudio the default for all article operations
- Deprecate old wizard/editor navigation
- Clean up unused components

## Risk Mitigation

### Technical Risks
- **Real-time streaming failures**: Implement fallback to standard generation
- **Performance with large articles**: Add pagination and lazy loading
- **Browser compatibility**: Progressive enhancement approach

### User Experience Risks
- **Learning curve**: Comprehensive onboarding tutorial
- **Feature discovery**: Guided tooltips and hints
- **Mobile experience**: Responsive design with collapsible panels

## Timeline Summary

- **Week 1**: Core structure, basic panels, title generation
- **Week 2**: Outline creation, content generation, live preview
- **Week 3**: Knowledge base, streaming, advanced AI features
- **Week 4**: Integration, optimization, testing, deployment

## Next Steps

1. Create ArticleStudio.tsx with basic layout
2. Implement useArticleStudio hook for state management
3. Build ControlPanel and PreviewPanel components
4. Add resizable panel functionality
5. Integrate with existing article creation logic

This unified approach will solve the current navigation and loading issues while providing a much more engaging and efficient article creation experience.
