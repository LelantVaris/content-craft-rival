
# Article Studio Master Plan

## Project Overview
**Goal**: Create a modern 3-step Article Studio with web research, simultaneous editing, and SEO optimization  
**Current Status**: Phase 0 Complete ✅, Phase 1 Database Complete ✅, Phase 2 Conditional Statistics Complete ✅  
**Target**: Complete MVP with clean UI, real-time streaming and enhanced UX

## Strategic Vision

### Core Experience
Transform article creation from a basic form-based approach to an AI-powered, interactive experience with:
- **3-Step Workflow**: Title → Outline → Article Generation
- **Clean Dual-Panel Layout**: 40/60 resizable panels without headers or visual separators
- **Progressive Content Display**: Empty states, title selection, outline creation, article preview
- **Conditional Statistics**: Stats/SEO/Publishing shown only when relevant ✅ COMPLETED
- **Real-time Streaming**: Section-by-section content generation with progress indicators
- **Simultaneous Editing**: Users can edit while content streams using Novel WYSIWYG editor
- **Web Research Integration**: Enhanced content quality through automated research
- **SEO Optimization**: Built-in SEO scoring and keyword optimization

### Key Design Principles
- [x] **Clean Interface**: Removed panel headers and visual noise ✅ COMPLETED
- [x] **Conditional Display**: Hide irrelevant information until needed ✅ COMPLETED
- [ ] **Progressive Disclosure**: Each step reveals appropriate content
- [ ] **Real-time Feedback**: Live preview and streaming content generation
- [ ] **User Control**: Ability to edit, customize, and override AI suggestions
- [ ] **Quality Focus**: Research-backed content with SEO optimization

## Technical Architecture Decisions

### ✅ Finalized Technical Choices

#### Layout & UI Framework
- [x] **Layout**: 40/60 resizable panels using `react-resizable-panels`
- [x] **Left Panel**: Step-based controls and forms (40% width)
- [x] **Right Panel**: Dynamic content preview area (60% width)
- [x] **Headers**: Removed "Control Panel" and "Live Preview" headers for clean interface ✅ COMPLETED
- [x] **Visual Separators**: No visual separator between panels, hidden resizable handle by default ✅ COMPLETED
- [x] **Conditional Display**: Stats, SEO, and Publishing options shown only when relevant ✅ COMPLETED
- [ ] **Editor**: Novel WYSIWYG with simultaneous editing capabilities
- [x] **Foundation**: Fixed SidebarInset integration ✅ COMPLETED

#### Content Generation Strategy
- [ ] **Primary Approach**: Two-phase generation per section
  - [ ] **Phase 1**: Generate skeleton outline and rough content
  - [ ] **Phase 2**: Enhance each section with web search optimization
- [ ] **Web Research**: Raw OpenAI (primary) with Tavily upgrade option
- [ ] **Streaming**: Real-time section-by-section content insertion
- [ ] **Progress Display**: Loading screen overlays between steps with status updates

#### AI Integration Architecture
- [ ] **Primary Choice**: AI SDK migration from manual OpenAI API streaming
- [ ] **Reason**: Resolves React Error #31 and streaming reliability issues
- [ ] **Implementation**: Replace custom SSE parsing with battle-tested AI SDK
- [ ] **Benefits**: Better error handling, type safety, reduced maintenance

#### Database & Persistence
- [x] **SEO Settings**: Save to `user_seo_preferences` table for user preferences ✅ COMPLETED
- [x] **Session Management**: Maintain settings across sessions ✅ COMPLETED
- [ ] **Article Storage**: Enhanced with scheduling and calendar integration

### Example Topics Strategy
- [ ] **Random Selection**: No dropdown, simple random example topics
- [ ] **No Categories**: Single pool of example topics for now
- [ ] **General Topics**: Don't need to be more specific yet
- [ ] **Examples**:
  - [ ] "How to reduce customer churn in B2B SaaS"
  - [ ] "Building a sales funnel for early-stage startups"
  - [ ] "Content marketing strategies for technical products"
  - [ ] "Pricing strategies for subscription businesses"

## 3-Step Workflow Design

### Step 1: Title Input & Configuration
**Left Panel**:
- [ ] Large topic input field with "Write an article about..." prompt
- [ ] "Try Example" button (random topics, no dropdown)
- [ ] SEO Pro Mode toggle with inline sections:
  - [ ] Target Audience (text input)
  - [ ] Keywords (text input with tag functionality)
  - [ ] Tone (select dropdown: Professional, Casual, Technical)
  - [ ] Length (select dropdown: Short 500-800, Medium 800-1500, Long 1500+)

**Right Panel**:
- [ ] Empty state with search icon in rounded square
- [ ] Copy: "No titles generated" + "Describe your topic to our AI to start generating creative article ideas and titles."
- [ ] Title generation input field (sits on right panel)
- [ ] "Write my own title" fallback option

### Step 2: Title Selection & Outline Creation
**Left Panel**: 
- [ ] Form in review mode with edit capability
- [ ] Outline management with drag-and-drop controls

**Right Panel**: 
- [ ] Generated titles in selectable cards with auto-selection
- [ ] Hierarchical outline preview with inline editing
- [ ] Loading overlay between steps

### Step 3: Article Generation
**Left Panel**: 
- [ ] Generation progress tracking and controls
- [ ] Step completion indicators

**Right Panel**: 
- [ ] Novel editor with real-time streaming and simultaneous editing
- [x] Conditional display of statistics after generation complete ✅ COMPLETED:
  - [x] Word count, read time, SEO score (shown when content >500 chars)
  - [x] Keywords analysis, structure analysis (shown when content >1000 chars)
  - [x] Readiness percentage (shown when content >800 chars with title)
- [x] SEO analysis panel (shown after substantial content) ✅ COMPLETED
- [x] Publishing options (shown when article is ready) ✅ COMPLETED
- [ ] Article length must match target length setting

## Implementation Phases

### Phase 0: Layout Foundation ✅ COMPLETED
- [x] Fixed SidebarInset integration for proper content resizing
- [x] Content area fills full available width dynamically
- [x] Header with SidebarTrigger and breadcrumbs implemented

### Phase 1: Database Setup & Core Layout ✅ COMPLETED
- [x] Create `user_seo_preferences` table with RLS policies
- [x] Implement resizable 40/60 panel layout
- [x] Remove panel headers for clean interface
- [x] Set up conditional display architecture

### Phase 2: Clean UI Implementation ✅ PARTIALLY COMPLETED
**Goal**: Implement clean, progressive interface with reference design matching
- [x] Remove visual separators and hide resizable handle by default ✅ COMPLETED
- [x] Conditional statistics display implementation ✅ COMPLETED
- [ ] Create empty state display with search icon illustration
- [ ] Update messaging: "No titles generated" with descriptive copy
- [ ] Add "Try example" button with random topics (no dropdown)
- [ ] Update step labels to "Title", "Outline", "Article" (keep descriptions)
- [ ] Move title generation input to right panel
- [ ] Implement loading screen overlays between steps
- [ ] Ensure article length matches target setting
- [ ] Match color schema from reference screenshots

### Phase 3: AI SDK Migration 🔲 NEXT PRIORITY
**Goal**: Resolve streaming reliability issues
- [ ] Replace manual OpenAI streaming with AI SDK
- [ ] Fix React Error #31 through proper type handling
- [ ] Implement reliable title generation with SEO parameters
- [ ] Add comprehensive error handling and recovery

### Phase 4: Enhanced Content Generation 🔲 PENDING
**Goal**: Two-phase generation with web research
- [ ] Implement skeleton → enhanced content pipeline
- [ ] Add web search integration per section
- [ ] Create section-by-section streaming with progress indicators
- [ ] Enable simultaneous editing during generation

### Phase 5: Advanced Features & Polish 🔲 PENDING
**Goal**: Production-ready experience
- [ ] Complete outline creation with drag-and-drop
- [ ] Add comprehensive SEO optimization
- [ ] Implement publishing and export capabilities
- [ ] Performance optimization and comprehensive testing

## Success Metrics & Goals

### Technical Performance
- [ ] **Streaming Reliability**: 99%+ successful completion rate
- [ ] **Generation Speed**: Complete article in <2 minutes
- [ ] **Error Rate**: <1% React errors, <5% API failures
- [ ] **User Experience**: Seamless workflow completion in <5 minutes

### Content Quality
- [ ] **SEO Optimization**: Automatic keyword integration and scoring
- [ ] **Research Integration**: Up-to-date, research-backed content
- [ ] **User Satisfaction**: Minimal editing required post-generation
- [ ] **Variety**: Diverse, non-repetitive content suggestions
- [ ] **Length Accuracy**: Generated articles match target length settings

### User Adoption
- [ ] **Workflow Completion**: >90% of started articles completed
- [ ] **Feature Usage**: >85% SEO Pro mode adoption
- [ ] **Time Savings**: 70% reduction in article creation time
- [ ] **Return Usage**: Saved preferences leading to faster subsequent use

## Risk Mitigation Strategy

### Technical Risks
- [ ] **Streaming Failures**: AI SDK provides robust error recovery
- [ ] **Performance Issues**: Progressive enhancement and caching
- [ ] **Editor Conflicts**: Transaction-based updates for simultaneous editing
- [ ] **API Limitations**: Fallback strategies and rate limiting

### User Experience Risks
- [ ] **Learning Curve**: Comprehensive onboarding and help documentation
- [ ] **Feature Overload**: Progressive disclosure and clear navigation
- [ ] **Content Quality**: Preview and editing capabilities throughout process
- [ ] **Mobile Experience**: Responsive design with collapsible panels

### Business Risks
- [ ] **User Adoption**: Gradual migration from existing wizard
- [ ] **Performance Expectations**: Clear communication of generation times
- [ ] **Content Accuracy**: Source attribution and fact-checking reminders
- [ ] **Scalability**: Modular architecture for easy feature additions

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

This master plan serves as the strategic foundation for all Article Studio development, ensuring consistency and alignment across all implementation efforts.
