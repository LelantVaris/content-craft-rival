
# Article Studio Master Plan

## Project Overview
**Goal**: Create a modern 4-step Article Studio with web research, simultaneous editing, and SEO optimization  
**Current Status**: Phase 0 Complete ✅, Phase 1 in Progress  
**Target**: Complete MVP with real-time streaming and enhanced UX

## Strategic Vision

### Core Experience
Transform article creation from a basic form-based approach to an AI-powered, interactive experience with:
- **4-Step Workflow**: Title → Selection → Outline → Generation
- **Real-time Streaming**: Section-by-section content generation with progress indicators
- **Simultaneous Editing**: Users can edit while content streams using Novel WYSIWYG editor
- **Web Research Integration**: Enhanced content quality through automated research
- **SEO Optimization**: Built-in SEO scoring and keyword optimization

### Key Design Principles
1. **Unified Interface**: Single-page experience eliminating navigation issues
2. **Real-time Feedback**: Live preview and streaming content generation
3. **Progressive Enhancement**: Each step builds upon the previous
4. **User Control**: Ability to edit, customize, and override AI suggestions
5. **Quality Focus**: Research-backed content with SEO optimization

## Technical Architecture Decisions

### ✅ Finalized Technical Choices

#### Layout & UI Framework
- **Layout**: 40/60 resizable panels using `react-resizable-panels`
- **Left Panel**: Step-based controls and forms (40% width)
- **Right Panel**: Dynamic content preview area (60% width)
- **Editor**: Novel WYSIWYG with simultaneous editing capabilities
- **Foundation**: Fixed SidebarInset integration ✅ COMPLETED

#### Content Generation Strategy
- **Primary Approach**: Two-phase generation per section
  - **Phase 1**: Generate skeleton outline and rough content
  - **Phase 2**: Enhance each section with web search optimization
- **Web Research**: Raw OpenAI (primary) with Tavily upgrade option
- **Streaming**: Real-time section-by-section content insertion
- **Progress Display**: Single line status updates that replace each other

#### AI Integration Architecture
- **Primary Choice**: AI SDK migration from manual OpenAI API streaming
- **Reason**: Resolves React Error #31 and streaming reliability issues
- **Implementation**: Replace custom SSE parsing with battle-tested AI SDK
- **Benefits**: Better error handling, type safety, reduced maintenance

#### Database & Persistence
- **SEO Settings**: Save to `user_seo_preferences` table for user preferences
- **Session Management**: Maintain settings across sessions
- **Article Storage**: Enhanced with scheduling and calendar integration

### Example Topics Strategy
**Focus Areas**: Marketing, B2B SaaS, Sales, Startups
**Examples**:
- "How to reduce customer churn in B2B SaaS"
- "Building a sales funnel for early-stage startups"
- "Content marketing strategies for technical products"
- "Pricing strategies for subscription businesses"

## 4-Step Workflow Design

### Step 1: Title Input & Configuration
**Left Panel**:
- Large topic input field with "Write an article about..." prompt
- "Try Example" button (Marketing/B2B/Sales/Startup topics)
- SEO Pro Mode toggle with collapsible sections:
  - Target Audience (text input)
  - Keywords (text input with tag functionality)
  - Tone (select dropdown: Professional, Casual, Technical)
  - Length (select dropdown: Short 500-800, Medium 800-1500, Long 1500+)
- Generation controls with title count selector (3-10, default 5)

**Right Panel**:
- Empty state with help guidance
- "Write my own title" fallback option

### Step 2: Title Selection
**Left Panel**: Form in review mode with edit capability
**Right Panel**: Generated titles in selectable cards with auto-selection

### Step 3: Outline Creation
**Left Panel**: Outline management with drag-and-drop controls
**Right Panel**: Hierarchical outline preview with inline editing

### Step 4: Article Generation
**Left Panel**: Generation progress tracking and controls
**Right Panel**: Novel editor with real-time streaming and simultaneous editing

## Implementation Phases

### Phase 0: Layout Foundation ✅ COMPLETED
- [x] Fixed SidebarInset integration for proper content resizing
- [x] Content area fills full available width dynamically
- [x] Header with SidebarTrigger and breadcrumbs implemented

### Phase 1: Database Setup & Core Layout 🔄 IN PROGRESS
**Priority**: Critical Foundation
- [ ] Create `user_seo_preferences` table with RLS policies
- [ ] Implement resizable 40/60 panel layout
- [ ] Create Step 1 components (topic input, SEO Pro mode, examples)
- [ ] Add empty state display and generation controls

### Phase 2: AI SDK Migration 🔲 NEXT PRIORITY
**Goal**: Resolve streaming reliability issues
- [ ] Replace manual OpenAI streaming with AI SDK
- [ ] Fix React Error #31 through proper type handling
- [ ] Implement reliable title generation with SEO parameters
- [ ] Add comprehensive error handling and recovery

### Phase 3: Enhanced Content Generation 🔲 PENDING
**Goal**: Two-phase generation with web research
- [ ] Implement skeleton → enhanced content pipeline
- [ ] Add web search integration per section
- [ ] Create section-by-section streaming with progress indicators
- [ ] Enable simultaneous editing during generation

### Phase 4: Advanced Features & Polish 🔲 PENDING
**Goal**: Production-ready experience
- [ ] Complete outline creation with drag-and-drop
- [ ] Add comprehensive SEO optimization
- [ ] Implement publishing and export capabilities
- [ ] Performance optimization and comprehensive testing

## Success Metrics & Goals

### Technical Performance
- **Streaming Reliability**: 99%+ successful completion rate
- **Generation Speed**: Complete article in <2 minutes
- **Error Rate**: <1% React errors, <5% API failures
- **User Experience**: Seamless workflow completion in <5 minutes

### Content Quality
- **SEO Optimization**: Automatic keyword integration and scoring
- **Research Integration**: Up-to-date, research-backed content
- **User Satisfaction**: Minimal editing required post-generation
- **Variety**: Diverse, non-repetitive content suggestions

### User Adoption
- **Workflow Completion**: >90% of started articles completed
- **Feature Usage**: >85% SEO Pro mode adoption
- **Time Savings**: 70% reduction in article creation time
- **Return Usage**: Saved preferences leading to faster subsequent use

## Risk Mitigation Strategy

### Technical Risks
1. **Streaming Failures**: AI SDK provides robust error recovery
2. **Performance Issues**: Progressive enhancement and caching
3. **Editor Conflicts**: Transaction-based updates for simultaneous editing
4. **API Limitations**: Fallback strategies and rate limiting

### User Experience Risks
1. **Learning Curve**: Comprehensive onboarding and help documentation
2. **Feature Overload**: Progressive disclosure and clear navigation
3. **Content Quality**: Preview and editing capabilities throughout process
4. **Mobile Experience**: Responsive design with collapsible panels

### Business Risks
1. **User Adoption**: Gradual migration from existing wizard
2. **Performance Expectations**: Clear communication of generation times
3. **Content Accuracy**: Source attribution and fact-checking reminders
4. **Scalability**: Modular architecture for easy feature additions

## Future Roadmap

### Post-MVP Enhancements
- **Advanced AI Features**: Custom writing styles and brand voice
- **Collaboration**: Multi-user editing and review workflows
- **Analytics**: Content performance tracking and optimization
- **Integrations**: Enhanced CMS publishing and social media distribution
- **Enterprise Features**: Team management and approval workflows

### Platform Evolution
- **Mobile App**: Native mobile article creation experience
- **API Access**: Third-party integrations and automation
- **White Label**: Customizable interface for enterprise clients
- **Advanced Research**: Integration with premium research databases

This master plan serves as the strategic foundation for all Article Studio development, ensuring consistency and alignment across all implementation efforts.
