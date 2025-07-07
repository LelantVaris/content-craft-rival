
# Article Generation Debugging Guide

## Issue: Timeout Error During Article Generation

### Problem Description
The enhanced article generation feature is experiencing timeout issues where the process is aborted after 30 seconds, resulting in an `AbortError: BodyStreamBuffer was aborted`.

### Root Cause Analysis
- **Client-side timeout**: 30-second timeout is too short for comprehensive article generation
- **Generation time**: Complex articles with 4000+ words and detailed PVOD framework implementation require 60-90 seconds
- **Streaming issues**: Long OpenAI API calls without intermediate progress updates cause connection timeouts

### Console Log Evidence
```
📤 Making PVOD content request...
📥 Response received: Status: 200, OK: true
🔄 Starting to read stream...
❌ Request was aborted (timeout)
Error: AbortError: BodyStreamBuffer was aborted
```

### Debug Status
✅ Parameters are correctly validated and passed to the edge function
✅ Supabase session and authentication working properly  
✅ Edge function receives request successfully (200 OK response)
✅ Stream reading starts correctly
❌ Process times out after 30 seconds during content generation

## Comprehensive Fix Plan

### Phase 1: Increase Client-Side Timeout ⭐ URGENT
- **Current**: 30-second timeout
- **Target**: 120 seconds (2 minutes)
- **File**: `src/hooks/useEnhancedContentGeneration.ts`
- **Change**: Update AbortController timeout from 30000ms to 120000ms

### Phase 2: Add Streaming Progress Indicators
- **Problem**: No intermediate feedback during long generation
- **Solution**: Edge function sends progress updates every 10-15 seconds
- **File**: `supabase/functions/generate-enhanced-content/index.ts`
- **Implementation**: Add keep-alive progress events during OpenAI streaming

### Phase 3: Optimize Edge Function Performance
- **Current**: Single large OpenAI call
- **Optimization**: Progressive streaming and better error handling
- **Features**:
  - Connection keep-alive mechanisms
  - Partial content recovery
  - Fallback for incomplete generations

### Phase 4: Improve User Experience
- **Status messages**: "This may take up to 2 minutes..."
- **Progress indicators**: Show estimated time remaining
- **Phase display**: Show current generation step

## Implementation Priority
1. **Immediate**: Fix timeout (Phase 1) - 5 minutes
2. **Short-term**: Add progress indicators (Phase 2) - 15 minutes  
3. **Medium-term**: Optimize performance (Phase 3) - 30 minutes
4. **Enhancement**: Improve UX (Phase 4) - 15 minutes

## Expected Results
- ✅ Articles generate successfully without timing out
- ✅ Users see progress during 60-90 second generation
- ✅ Better error handling and recovery
- ✅ Improved user feedback and experience

## Test Cases
- [ ] Generate 4000-word article with complex outline
- [ ] Verify progress updates appear every 10-15 seconds
- [ ] Test timeout handling with 2-minute limit
- [ ] Confirm partial content recovery on interruption
