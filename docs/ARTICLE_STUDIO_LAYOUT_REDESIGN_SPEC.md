
# Article Studio Layout Redesign Specification

## Overview
Complete redesign of Article Studio to match the provided HTML reference layout with proper workflow progression and UI/UX improvements.

## Critical Requirements

### 1. Sidebar Configuration
- **MUST**: Sidebar closed by default (`defaultOpen={false}` in SidebarProvider)
- **FILE**: `src/App.tsx` or wherever SidebarProvider is initialized
- **REASON**: Maximize space for Article Studio interface

### 2. Header Styling
- **MUST**: Header with "Article Studio" title is sticky/fixed
- **CSS**: `position: sticky; top: 0; z-index: 50`
- **FILE**: `src/pages/ArticleStudio.tsx`
- **BEHAVIOR**: Header remains visible during scroll

### 3. Right Panel Height Constraint
- **MUST**: Right panel container has `max-height: 100vh`
- **MUST**: Add `overflow-y: auto` for scrolling
- **FILE**: `src/pages/ArticleStudio.tsx` - ResizablePanel for right side
- **REASON**: Prevent content extending beyond viewport

## Left Panel Complete Restructure

### Current Structure to Remove
- Remove complex accordion/card structure from `src/components/ArticleStudio/UnifiedControlPanel.tsx`
- Remove `StepNavigation` component from left panel (move to right panel)

### New Left Panel Structure (Top to Bottom)
1. **Step Navigation Breadcrumb** (at top)
   - Format: "Title" → "Outline" → "Article"
   - Show current step as active
   - Mark completed steps appropriately

2. **Content Brief Section**
   - **Label**: "Write an article about..." (14px font-size, 600 font-weight)
   - **Input**: Multi-line textarea (5 rows, placeholder: "a how-to guide on writing convincingly")
   - **Button**: "Try example" with shuffle icon (aligned right)

3. **SEO Pro Mode Toggle**
   - **Label**: "⚡ SEO pro mode" (14px font-size, 600 font-weight)
   - **Toggle**: Switch component
   - **Position**: ABOVE Keywords section

4. **Keywords Section** (Collapsible - shown when SEO Pro Mode enabled)
   - **Container**: White background, rounded border, padding
   - **Label**: "Keywords" (14px font-size, 600 font-weight)
   - **Input**: Single line input with "best writing tools" placeholder
   - **Button**: Add button icon in input field

5. **Tone & Length Section**
   - **Tone Dropdown**: 
     - Label: "Tone" (14px font-size, 600 font-weight)
     - Options: Professional, Casual, etc.
     - Default: "Professional"
   - **Length Dropdown**:
     - Label: "Length" (14px font-size, 600 font-weight)  
     - Options: Short (~800 words), Medium (~1,500 words), Long (~2,500 words)
     - Default: "Medium (~1,500 words)"

6. **Advanced Customizations** (Collapsible Accordion)
   - Point of view selection (First person, Second person, Third person)
   - Audience description textarea
   - Brand description textarea
   - Product/service description textarea

7. **Fixed Bottom Section** (Sticky)
   - **Generate Titles Button**: Full width, primary color, disabled when no topic
   - **Titles Counter**: "# of titles" with +/- buttons (default: 4)
   - **Position**: `position: sticky; bottom: 0`
   - **Background**: White with top border

### Critical Left Panel Requirements
- **ALL LABELS**: 14px font-size, 600 font-weight
- **SPACING**: Match HTML reference exactly
- **COLORS**: Match provided color scheme
- **ICONS**: Use correct icons (shuffle, info, dropdown arrows)
- **DISABLE STATES**: Generate button disabled until topic has content

## Right Panel Progressive Display

### Install Required Component
```bash
npx shadcn@latest add "https://21st.dev/r/anurag-mishra22/animated-loading-skeleton"
```

### Right Panel States (Mutually Exclusive)

#### State 1: Empty State
- **WHEN**: No topic entered or no titles generated
- **DISPLAY**: 
  - Placeholder image (centered)
  - "No titles generated" heading
  - Description text about describing topic to AI
  - "Write my own title" button (centered)
- **FILE**: Update `src/components/ArticleStudio/LivePreviewPanel.tsx`

#### State 2: Loading State (Title Generation)
- **WHEN**: Generate titles button clicked and API call in progress
- **DISPLAY**:
  - Animated loading skeleton
  - "Generating your titles..." text
  - Use imported animated loading skeleton component

#### State 3: Title Selection
- **WHEN**: Titles generated successfully
- **DISPLAY**:
  - List of radio button options for generated titles
  - "Write my own title" option with text input
  - Titles displayed as selectable cards/options

#### State 4: Outline Display  
- **WHEN**: Title selected (auto-progression)
- **DISPLAY**:
  - Generated outline content
  - Loading state while outline generates
  - **BEHAVIOR**: Auto-generate outline when title is selected

#### State 5: Article Preview
- **WHEN**: Outline completed, article generation initiated
- **DISPLAY**:
  - Streaming article content
  - Article statistics
  - Publishing options

### Right Panel Bottom Navigation
- **Continue/Back Buttons**: Positioned at bottom of right panel
- **Position**: `position: sticky; bottom: 0`
- **Show Logic**:
  - Back button: Show when currentStep > 1
  - Continue button: Show when can proceed to next step
- **FILE**: `src/components/ArticleStudio/LivePreviewPanel.tsx`

## Workflow Logic Specifications

### Step Progression Rules
1. **Step 1 (Title)**:
   - Complete when: `selectedTitle` OR `customTitle` exists
   - Auto-progress to Step 2 when title selected

2. **Step 2 (Outline)**:
   - **CRITICAL**: Auto-generate outline when title is selected
   - Complete when: `outline.length > 0`
   - Auto-progress to Step 3 when outline generated

3. **Step 3 (Article)**:
   - Manual trigger for article generation
   - Complete when: `generatedContent` exists

### Auto-Generation Requirements
- **Title Selection → Outline Generation**: Automatic
- **API Call**: Use `generate-outline` edge function
- **Loading State**: Show in right panel during outline generation
- **Error Handling**: Show error state if outline generation fails

## API Integration Points

### Title Generation
- **Trigger**: "Generate titles" button in left panel
- **Endpoint**: `generate-titles` edge function  
- **Payload**: topic, keywords, audience, number of titles
- **Response**: Array of title strings
- **Loading**: Show animated skeleton in right panel

### Outline Generation  
- **Trigger**: Automatic when title selected
- **Endpoint**: `generate-outline` edge function
- **Payload**: selected title, topic, keywords
- **Response**: Outline structure
- **Loading**: Show loading state in right panel

### Article Generation
- **Trigger**: Manual (existing functionality)
- **Endpoint**: `generate-content` edge function (existing)
- **Behavior**: Streaming content display (keep existing)

## File Modification Requirements

### Core Files to Modify
1. **`src/App.tsx`**
   - Add `defaultOpen={false}` to SidebarProvider

2. **`src/pages/ArticleStudio.tsx`**
   - Make header sticky
   - Set right panel max-height: 100vh

3. **`src/components/ArticleStudio/UnifiedControlPanel.tsx`**
   - **COMPLETE RESTRUCTURE** - remove existing layout
   - Implement new left panel structure exactly as specified
   - Move StepNavigation to top of left panel
   - Add fixed bottom section with Generate Titles button

4. **`src/components/ArticleStudio/LivePreviewPanel.tsx`**
   - Implement 5 distinct states as specified
   - Add continue/back buttons to bottom
   - Handle state transitions

5. **`src/hooks/useArticleStudio.ts`**
   - Add auto-progression logic
   - Handle outline auto-generation
   - Update step management

### New Components to Create
- **`src/components/ArticleStudio/TitleGenerationSection.tsx`**: Fixed bottom section
- **`src/components/ArticleStudio/ContentBriefForm.tsx`**: Main form section
- **`src/components/ArticleStudio/EmptyStateDisplay.tsx`**: Update if needed

## Visual Requirements

### Typography
- **All form labels**: 14px font-size, 600 font-weight, color: rgb(16, 24, 40)
- **Body text**: 14px font-size, 400 font-weight
- **Match HTML reference exactly**

### Colors
- **Primary buttons**: Match existing purple/blue gradient
- **Borders**: rgb(208, 213, 221)
- **Background**: White
- **Text**: rgb(16, 24, 40) for labels, rgb(52, 64, 84) for content

### Spacing
- **Padding**: 12px, 16px, 24px as per HTML reference
- **Gaps**: 8px, 16px, 24px as per HTML reference
- **Match HTML structure spacing exactly**

## Testing Requirements

### Functional Testing
1. **Sidebar**: Verify closes by default
2. **Header**: Verify stays sticky on scroll
3. **Step Progression**: Test auto-progression works
4. **API Integration**: Test all three API endpoints
5. **State Management**: Verify state transitions work correctly

### Visual Testing  
1. **Compare with HTML reference**: Pixel-perfect match required
2. **Typography**: Verify all font sizes and weights
3. **Spacing**: Verify margins and padding match
4. **Colors**: Verify color scheme matches exactly

## Critical Implementation Notes

### DO NOT
- Change any existing business logic unnecessarily
- Modify article generation streaming functionality  
- Change API endpoints or data structures
- Remove existing error handling

### DO
- Follow exact HTML structure provided
- Implement auto-progression as specified
- Add proper loading states
- Maintain existing functionality while improving UX
- Create focused, small components
- Keep files under 200 lines when possible

## Success Criteria
- [ ] Sidebar closed by default
- [ ] Header is sticky/fixed
- [ ] Right panel constrained to 100vh
- [ ] Left panel matches HTML reference exactly
- [ ] Progressive display in right panel works
- [ ] Auto-progression: Title → Outline → Article
- [ ] Continue/Back buttons in right panel
- [ ] All API integrations working
- [ ] Loading states implemented
- [ ] Typography matches specification (14px, 600 weight labels)
- [ ] Visual design matches HTML reference

## File Structure After Implementation
```
src/components/ArticleStudio/
├── UnifiedControlPanel.tsx (restructured)
├── LivePreviewPanel.tsx (enhanced states)
├── ContentBriefForm.tsx (new)
├── TitleGenerationSection.tsx (new)
├── EmptyStateDisplay.tsx (updated)
├── AnimatedLoadingSkeleton.tsx (new)
└── ... (existing components)
```

This specification must be followed exactly with no deviations or interpretations.
