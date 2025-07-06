# AI SDK Migration Guide - Enhanced Content Generation

## Migration Overview
**Goal**: Replace Supabase Edge Functions with AI SDK for enhanced content generation streaming  
**Status**: 🔄 READY TO IMPLEMENT  
**Issue**: Supabase Edge Functions struggling with streaming responses  
**Solution**: Use AI SDK's native streaming capabilities with OpenAI integration  
**Estimated Time**: 4.5 hours total  

---

## MIGRATION PHASES

### ✅ Phase 0: Pre-Migration Analysis - COMPLETED
- [x] **Root Cause Identified**: Supabase Edge Functions not handling streaming properly
- [x] **AI SDK Research**: Confirmed AI SDK is purpose-built for streaming UIs
- [x] **Architecture Decision**: Client-side streaming with AI SDK vs server-side SSE
- [x] **Dependencies Analysis**: AI SDK and @ai-sdk/openai packages needed

### 🔄 Phase 1: Environment Setup & Dependencies (30 minutes)

#### 1.1 Install AI SDK Dependencies
- [ ] **Install AI SDK Core**: `ai` package for streaming functionality
- [ ] **Install OpenAI Provider**: `@ai-sdk/openai` package for model integration
- [ ] **Verify Installation**: Confirm packages are properly installed in package.json

**Commands**:
```bash
npm install ai @ai-sdk/openai
```

**Files to Verify**:
- `package.json` - Dependencies added
- `package-lock.json` - Lock file updated

#### 1.2 Environment Configuration
- [ ] **OpenAI API Key**: Verify OPENAI_API_KEY is configured
- [ ] **Test Configuration**: Simple AI SDK test to verify setup
- [ ] **TypeScript Types**: Ensure AI SDK types are properly imported

**Environment Variables**:
- `OPENAI_API_KEY` - Required for AI SDK OpenAI integration

---

### 🔄 Phase 2: Core Hook Migration (2 hours)

#### 2.1 Replace Enhanced Generation Hook
**File**: `src/hooks/useEnhancedContentGeneration.ts` (242 lines - NEEDS REFACTORING)

**Current Architecture (PROBLEMATIC)**:
```typescript
// Manual SSE handling with fetch
const response = await fetch(functionUrl, {
  method: 'POST',
  headers,
  body: JSON.stringify(requestBody)
});

const reader = response.body?.getReader();
// Complex manual stream parsing...
```

**New Architecture (AI SDK)**:
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { textStream, isLoading, error } = await streamText({
  model: openai('gpt-4o'),
  prompt: enhancedPrompt,
  onFinish: (result) => {
    setFinalContent(result.text);
  }
});
```

#### 2.2 Migration Tasks
- [ ] **Remove Supabase Function Call**: Delete fetch call to `generate-enhanced-content`
- [ ] **Import AI SDK**: Add `streamText` and `openai` imports
- [ ] **Replace Stream Handling**: Use AI SDK's built-in streaming
- [ ] **Update State Management**: Leverage AI SDK's loading/error states
- [ ] **Implement Section Generation**: Create section-by-section streaming logic
- [ ] **Add Progress Tracking**: Use AI SDK's streaming progress events
- [ ] **Error Handling**: Replace manual error parsing with AI SDK error handling

#### 2.3 Key Changes Required
- [ ] **Remove Manual SSE**: Delete `handleStreamEvent` function
- [ ] **Simplify State**: Use AI SDK's built-in state management
- [ ] **Update Interfaces**: Modify types to match AI SDK patterns
- [ ] **Clean Up Console Logs**: Remove complex debugging, use AI SDK's built-in logging

#### 2.4 Success Criteria for Phase 2
- [ ] **Single Function Call**: Replace complex SSE with simple `streamText` call
- [ ] **Real-time Streaming**: Content streams immediately without manual parsing
- [ ] **State Synchronization**: AI SDK state syncs with React components
- [ ] **Error Recovery**: Automatic retry and error handling working
- [ ] **TypeScript Compliance**: All types properly defined and working

---

### 🔄 Phase 3: Component Integration (1 hour)

#### 3.1 Update Streaming Components
**Files to Modify**:
- `src/components/ArticleStudio/StreamingArticlePreview.tsx`
- `src/components/ArticleStudio/SectionStreamingPreview.tsx`
- `src/components/ArticleStudio/ContentGenerationPanel.tsx` (223 lines - NEEDS REFACTORING)

#### 3.2 Component Integration Tasks
- [ ] **Remove Duplicate Hook**: Delete `useEnhancedContentGeneration` instances from components
- [ ] **Use AI SDK State**: Receive streaming state from centralized hook
- [ ] **Update Loading States**: Use AI SDK's `isLoading` instead of custom loading
- [ ] **Implement Error Display**: Use AI SDK's error state for user feedback
- [ ] **Real-time Updates**: Connect AI SDK streaming to UI components

#### 3.3 Props Threading Updates
**Files to Update**:
- [ ] `src/hooks/useArticleStudio.ts` (256 lines - NEEDS REFACTORING)
- [ ] `src/pages/ArticleStudio.tsx`
- [ ] `src/components/ArticleStudio/LivePreviewPanel.tsx`

#### 3.4 Integration Pattern
```typescript
// In useArticleStudio.ts
const enhancedGeneration = useEnhancedContentGeneration();

// Pass to components
return {
  // ... existing article studio state
  enhancedGeneration, // AI SDK streaming state
};
```

---

### 🔄 Phase 4: Backend Cleanup (30 minutes)

#### 4.1 Remove Edge Function Dependencies
- [ ] **Delete Edge Function**: Remove `supabase/functions/generate-enhanced-content/index.ts`
- [ ] **Clean Up References**: Remove any imports or calls to the edge function
- [ ] **Update Configuration**: Remove edge function from supabase config if needed

#### 4.2 Files to Clean Up
- [ ] **Edge Function File**: `supabase/functions/generate-enhanced-content/index.ts` - DELETE
- [ ] **Function References**: Search codebase for any remaining references
- [ ] **Environment Variables**: Clean up any edge function specific env vars

---

### 🔄 Phase 5: Testing & Validation (1 hour)

#### 5.1 End-to-End Testing
- [ ] **Complete Workflow**: Test Title → Outline → Enhanced Generation
- [ ] **Real-time Streaming**: Verify content appears immediately in preview
- [ ] **Section Progress**: Test section-by-section generation updates
- [ ] **Error Handling**: Test error scenarios and recovery
- [ ] **Performance**: Verify generation completes in <2 minutes

#### 5.2 Integration Testing
- [ ] **State Synchronization**: Enhanced generation state flows to all components
- [ ] **Component Communication**: No duplicate hooks, single state source
- [ ] **UI Updates**: Real-time streaming visible in StreamingArticlePreview
- [ ] **Loading States**: Proper loading indicators throughout UI
- [ ] **Error Display**: Clear error messages shown to users

#### 5.3 Regression Testing
- [ ] **Existing Functionality**: Title and outline generation still working
- [ ] **Article Saving**: Generated content saves properly to database
- [ ] **Step Navigation**: 3-step workflow remains functional
- [ ] **Preview Updates**: Live preview updates correctly with streaming content

---

## IMPLEMENTATION CHECKLIST

### Prerequisites
- [ ] **OpenAI API Key**: Configured in environment variables
- [ ] **AI SDK Documentation**: Reviewed streaming patterns and examples
- [ ] **Current Code Analysis**: Understanding of existing enhanced generation flow

### Phase 1: Dependencies (30 min)
- [ ] Install `ai` package
- [ ] Install `@ai-sdk/openai` package
- [ ] Verify environment configuration
- [ ] Test basic AI SDK functionality

### Phase 2: Core Migration (2 hours)
- [ ] Backup current `useEnhancedContentGeneration.ts`
- [ ] Replace Supabase function call with AI SDK `streamText`
- [ ] Update state management to use AI SDK patterns
- [ ] Implement section-by-section generation
- [ ] Add proper error handling and loading states
- [ ] Test streaming functionality in isolation

### Phase 3: Component Integration (1 hour)
- [ ] Remove duplicate hook instances from components
- [ ] Update components to receive AI SDK state via props
- [ ] Thread props through component hierarchy
- [ ] Update loading and error display logic
- [ ] Test component integration with streaming

### Phase 4: Cleanup (30 min)
- [ ] Delete edge function file
- [ ] Remove edge function references
- [ ] Clean up unused imports and dependencies
- [ ] Update documentation

### Phase 5: Testing (1 hour)
- [ ] End-to-end workflow testing
- [ ] Real-time streaming verification
- [ ] Error handling testing
- [ ] Performance validation
- [ ] Regression testing

---

## MIGRATION BENEFITS

### Technical Advantages
- **Simplified Architecture**: No manual SSE handling required
- **Better Error Handling**: Automatic retry and error recovery
- **Type Safety**: Full TypeScript support throughout
- **Performance**: More efficient streaming with less overhead
- **Maintainability**: Cleaner, more focused codebase

### Developer Experience
- **Easier Debugging**: Clear error messages and state tracking
- **Faster Iteration**: Client-side generation allows rapid testing
- **Better Documentation**: AI SDK has comprehensive guides
- **Unified Codebase**: Everything in TypeScript/React ecosystem

### User Experience
- **Real-time Streaming**: Content appears immediately as generated
- **Better Performance**: Faster generation with less latency
- **Improved Reliability**: More stable streaming with automatic error recovery
- **Seamless Integration**: Smooth integration with existing UI components

---

## TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Issue 1: AI SDK Streaming Not Working
**Symptoms**: No content streaming, loading states stuck
**Solution**: 
- Verify OpenAI API key is properly configured
- Check AI SDK import statements
- Ensure `streamText` is properly awaited

#### Issue 2: Component State Not Updating
**Symptoms**: Generated content not appearing in preview
**Solution**:
- Verify props are threaded correctly through components
- Check that duplicate hooks are removed
- Ensure state synchronization is working

#### Issue 3: Performance Issues
**Symptoms**: Slow generation, UI freezing
**Solution**:
- Verify AI SDK is handling streaming efficiently
- Check for memory leaks in component updates
- Optimize re-rendering with proper React patterns

#### Issue 4: TypeScript Errors
**Symptoms**: Type errors with AI SDK integration
**Solution**:
- Update component interfaces to match AI SDK types
- Ensure proper type imports from AI SDK packages
- Check compatibility between AI SDK and existing types

---

## SUCCESS METRICS

### Functional Requirements
- ✅ **Real-time Streaming**: Content appears immediately in preview
- ✅ **Section Progress**: Section-by-section updates visible in UI
- ✅ **Error Handling**: Clear error messages and recovery
- ✅ **Performance**: Generation completes in <2 minutes
- ✅ **State Sync**: Single source of truth for enhanced generation

### Technical Requirements
- ✅ **Code Quality**: Clean, maintainable codebase
- ✅ **Type Safety**: Full TypeScript compliance
- ✅ **No Regressions**: Existing functionality preserved
- ✅ **Documentation**: Updated implementation guides
- ✅ **Testing**: Comprehensive test coverage

### User Experience Requirements
- ✅ **Seamless Integration**: No visible changes to user workflow
- ✅ **Improved Performance**: Faster, more reliable generation
- ✅ **Better Feedback**: Clear progress indicators and error messages
- ✅ **Consistent Behavior**: Predictable streaming behavior

---

## POST-MIGRATION TASKS

### Documentation Updates
- [ ] Update `ARTICLE_STUDIO_IMPLEMENTATION_GUIDE.md`
- [ ] Update `ARTICLE_STUDIO_IMPLEMENTATION_TRACKER.md`
- [ ] Add AI SDK patterns to development guidelines
- [ ] Create troubleshooting documentation

### Code Quality
- [ ] Review and refactor long files (>200 lines)
- [ ] Add proper TypeScript types for AI SDK integration
- [ ] Implement proper error boundaries
- [ ] Add unit tests for AI SDK integration

### Performance Optimization
- [ ] Monitor streaming performance metrics
- [ ] Optimize component re-rendering
- [ ] Implement proper loading states
- [ ] Add caching where appropriate

---

**CURRENT STATUS**: 📋 MIGRATION GUIDE CREATED - READY FOR IMPLEMENTATION  
**NEXT STEP**: Begin Phase 1 - Environment Setup & Dependencies  
**ESTIMATED COMPLETION**: 4.5 hours total development time  
**SUCCESS CRITERIA**: Real-time streaming article generation with AI SDK integration
