# Article Studio Simplified Rewrite Implementation Plan

## Overview
Complete rewrite of the Article Studio architecture to eliminate dual loading states, React Error #31, and complex event-driven communication. The goal is to implement a single source of truth with centralized state management.

## Current Issues
- [ ] Dual loading states causing UI conflicts
- [ ] React Error #31: Objects being rendered as React children (Promise objects)
- [ ] Complex event system with `window.addEventListener`/`dispatchEvent`
- [ ] `generate-outline` edge function returning 500 errors
- [ ] Race conditions between components
- [ ] Difficult debugging due to distributed state

## Step 1: Fix Edge Function First 🔧

### Checkpoint 1.1: Investigate generate-outline Function
- [x] Check `supabase/functions/generate-outline/index.ts` for errors
- [x] Review edge function logs for specific error details
- [x] Ensure OpenAI API key is properly configured
- [x] Test function independently

### Checkpoint 1.2: Fix Edge Function Issues
- [ ] Add proper error handling in `generate-outline` function
- [ ] Ensure consistent response format
- [ ] Add CORS headers if missing
- [ ] Test function returns proper data structure

### Code Reference:
```typescript
// Expected in supabase/functions/generate-outline/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

## Step 2: Centralized State Management 🏗️

### Checkpoint 2.1: Define Single State Interface
- [x] Create new interface in `src/hooks/useArticleStudio.ts`
- [x] Define `GenerationStep` enum
- [x] Remove duplicate loading state properties

```typescript
// Add to useArticleStudio.ts
export enum GenerationStep {
  IDLE = 'idle',
  GENERATING_TITLES = 'generating_titles',
  GENERATING_OUTLINE = 'generating_outline',
  GENERATING_ARTICLE = 'generating_article'
}

export interface ArticleStudioState {
  generationStep: GenerationStep;
  error?: string;
  // ... existing properties
}
```

### Checkpoint 2.2: Update ArticleStudio Hook
- [x] Replace `isGenerating` with `generationStep`
- [x] Add centralized error handling
- [ ] Create callback functions for each generation type
- [ ] Remove event-based communication

```typescript
// Update in src/hooks/useArticleStudio.ts
const [generationStep, setGenerationStep] = useState<GenerationStep>(GenerationStep.IDLE);

const handleGenerateTitles = useCallback(async () => {
  setGenerationStep(GenerationStep.GENERATING_TITLES);
  try {
    // ... title generation logic
    setGenerationStep(GenerationStep.IDLE);
  } catch (error) {
    setGenerationStep(GenerationStep.IDLE);
    // handle error
  }
}, []);
```

## Step 3: Remove Event System 🧹

### Checkpoint 3.1: Update TitleGenerationSection Component
- [ ] Remove all `window.addEventListener` calls from `src/components/ArticleStudio/TitleGenerationSection.tsx`
- [ ] Remove all `window.dispatchEvent` calls
- [ ] Accept callback props instead of managing async calls directly
- [ ] Update component interface

```typescript
// Update TitleGenerationSection.tsx interface
interface TitleGenerationSectionProps {
  onGenerateTitles: () => Promise<void>;
  onGenerateOutline: () => Promise<void>;
  onGenerateArticle: () => Promise<void>;
  generationStep: GenerationStep;
  // ... other props
}
```

### Checkpoint 3.2: Update LivePreviewPanel Component
- [ ] Remove event listeners from `src/components/ArticleStudio/LivePreviewPanel.tsx`
- [ ] Remove auto-triggering logic in useEffect
- [ ] Accept display state via props only
- [ ] Simplify rendering logic

```typescript
// Update LivePreviewPanel.tsx
// Remove these lines:
useEffect(() => {
  const handleTitleGeneration = (event: CustomEvent) => { ... };
  window.addEventListener('titles-generated', handleTitleGeneration);
  // ...
}, []);

// Replace with simple prop-based rendering
const isGeneratingTitles = generationStep === GenerationStep.GENERATING_TITLES;
```

## Step 4: Update Parent Component 🔄

### Checkpoint 4.1: Modify ArticleStudio Page
- [ ] Update `src/pages/ArticleStudio.tsx` to pass callback functions
- [ ] Pass `generationStep` to child components
- [ ] Remove complex prop drilling

```typescript
// Update ArticleStudio.tsx
<UnifiedControlPanel 
  onGenerateTitles={articleStudio.handleGenerateTitles}
  onGenerateOutline={articleStudio.handleGenerateOutline}
  onGenerateArticle={articleStudio.handleGenerateArticle}
  generationStep={articleStudio.generationStep}
  {...otherProps}
/>

<LivePreviewPanel 
  generationStep={articleStudio.generationStep}
  {...otherProps}
/>
```

### Checkpoint 4.2: Update UnifiedControlPanel
- [ ] Update `src/components/ArticleStudio/UnifiedControlPanel.tsx`
- [ ] Pass callbacks to TitleGenerationSection
- [ ] Remove local state management

## Step 5: Simplify Loading States 📱

### Checkpoint 5.1: Remove Duplicate Loading Logic
- [ ] Remove `AnimatedLoadingSkeleton` complex logic
- [ ] Use simple conditional rendering based on `generationStep`
- [ ] Ensure only one loading state shows at a time

```typescript
// Simple loading logic
const renderContent = () => {
  switch (generationStep) {
    case GenerationStep.GENERATING_TITLES:
      return <div>Generating titles...</div>;
    case GenerationStep.GENERATING_OUTLINE:
      return <div>Creating outline...</div>;
    case GenerationStep.GENERATING_ARTICLE:
      return <div>Writing article...</div>;
    default:
      return renderNormalContent();
  }
};
```

### Checkpoint 5.2: Fix StreamingStatus Type Safety
- [ ] Ensure `streamingStatus` is always string in `useArticleStudio.ts`
- [ ] Remove any Promise objects from React rendering
- [ ] Add proper type guards

```typescript
// Type-safe streaming status
const [streamingStatus, setStreamingStatus] = useState<string>('');

// Ensure only strings are set
const setStreamingStatusSafe = useCallback((status: string) => {
  if (typeof status === 'string') {
    setStreamingStatus(status);
  }
}, []);
```

## Step 6: Linear Flow Control 🔄

### Checkpoint 6.1: Remove Auto-triggering
- [ ] Remove automatic outline generation when title is selected
- [ ] Make each step explicitly user-controlled
- [ ] Add clear "Continue" buttons for each step

### Checkpoint 6.2: Implement Step Navigation
- [ ] Add proper step validation
- [ ] Clear states when going back
- [ ] Prevent skipping steps

```typescript
// Step validation logic
const canProceedToStep = useCallback((step: GenerationStep) => {
  switch (step) {
    case GenerationStep.GENERATING_OUTLINE:
      return !!(articleData.selectedTitle || articleData.customTitle);
    case GenerationStep.GENERATING_ARTICLE:
      return articleData.outline.length > 0;
    default:
      return true;
  }
}, [articleData]);
```

## Step 7: Error Handling & Testing 🧪

### Checkpoint 7.1: Centralized Error Management
- [ ] Add error state to main hook
- [ ] Display errors in UI consistently
- [ ] Clear errors when starting new operations
- [ ] Add retry mechanisms

### Checkpoint 7.2: Test All Scenarios
- [ ] Test title generation
- [ ] Test outline generation  
- [ ] Test article generation
- [ ] Test error scenarios
- [ ] Test step navigation
- [ ] Test loading states

## Success Criteria ✅

- [ ] Zero React Error #31 occurrences
- [ ] Single loading state visible at any time
- [ ] No window events in any component
- [ ] All edge functions return proper responses
- [ ] Smooth step progression without race conditions
- [ ] Clear error messages for failures
- [ ] Proper state cleanup on errors
- [ ] Improved debugging experience

## Files to Modify

### Core Files
- [ ] `src/hooks/useArticleStudio.ts` - Central state management
- [ ] `src/pages/ArticleStudio.tsx` - Parent component updates
- [ ] `src/components/ArticleStudio/UnifiedControlPanel.tsx` - Remove local state
- [ ] `src/components/ArticleStudio/TitleGenerationSection.tsx` - Remove events
- [ ] `src/components/ArticleStudio/LivePreviewPanel.tsx` - Simplify loading

### Edge Function
- [ ] `supabase/functions/generate-outline/index.ts` - Fix 500 errors

## Rollback Plan

If issues arise during implementation:
1. Commit changes at each checkpoint
2. Test functionality after each step
3. Keep backup of current working state
4. Implement changes incrementally, not all at once

## Post-Implementation

### Cleanup Tasks
- [ ] Remove unused event-related code
- [ ] Remove duplicate loading components if not needed elsewhere
- [ ] Update documentation
- [ ] Add TypeScript strict checks
- [ ] Performance testing

### Monitoring
- [ ] Check console for remaining errors
- [ ] Verify all generation flows work
- [ ] Test edge cases and error scenarios
- [ ] User acceptance testing
