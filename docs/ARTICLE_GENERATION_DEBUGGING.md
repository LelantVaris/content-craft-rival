# Novel Editor AI Features Debugging Guide

### Current Issues (Updated 2025-07-03)

### 1. Console Errors Analysis
```
1. [tiptap warn]: Duplicate extension names found: ['image', 'codeBlock'] ✅ FIXED
2. Invalid prop `data-lov-id` supplied to `React.Fragment` ✅ FIXED
3. Tiptap Markdown: "ai-highlight" mark is only available in html mode ✅ FIXED
4. Failed to load resource: api/generate 404 (Not Found) ❌ STILL PRESENT
```

### Root Cause Analysis
1. **Extension Conflicts**: ✅ FIXED - Duplicate extensions have been properly configured in extensions.ts
2. **Lovable Integration**: ✅ FIXED - Invalid prop has been removed from EditorBubble
3. **Markdown Mode**: ✅ FIXED - HTML mode is now enabled in markdown configuration
4. **API Endpoint**: ❌ STILL PRESENT - The generate endpoint is not properly configured for development environment

### Critical Failures
1. ❌ "Improve writing" - Not working (API endpoint issue)
2. ❌ "Fix grammar" - Not working (API endpoint issue)
3. ❌ "Make shorter" - Not working (API endpoint issue)
4. ❌ "Make longer" - Not working (API endpoint issue)
5. ❌ "Continue writing" - Not working (API endpoint issue)

## Updated Fix Plan

### Phase 1: Fix API Endpoint Configuration (Priority)
1. **Update API Configuration**
```typescript
// In src/utils/aiConfig.ts
export const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
  }
  // Development endpoint - match the expected path
  return `${window.location.origin}/api/generate`;
};
```

2. **Add Development API Route**
Create a new file at `src/api/generate.ts` with proper Vite/Express configuration to handle AI requests during development.

### Phase 2: Implement API Handler
1. **Create API Handler**
```typescript
// In src/api/generate.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { prompt, option } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an AI writing assistant...',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### Phase 3: Testing & Validation
1. **Test Each AI Command**
- [ ] Test "Improve writing"
- [ ] Test "Fix grammar"
- [ ] Test "Make shorter"
- [ ] Test "Make longer"
- [ ] Test "Continue writing"

2. **Verify Streaming Updates**
- [ ] Check content updates in real-time
- [ ] Verify proper error handling
- [ ] Test rate limiting functionality

## Expected Results After Fix
- ✅ No extension conflict warnings (COMPLETED)
- ✅ AI highlight working in markdown (COMPLETED)
- ❌ API endpoints responding correctly (PENDING)
- ❌ All AI commands functional (PENDING)
- ✅ Clean console (except API errors) (PARTIALLY COMPLETED)

## Next Steps
1. Implement the development API endpoint configuration
2. Add proper error handling for API failures
3. Test each AI command individually
4. Add proper loading states and error messages in the UI
5. Document the API integration process for future reference

## Key Differences from Working Example
1. **Extension Configuration**: ✅ FIXED - Properly configured in extensions.ts
2. **Markdown Mode**: ✅ FIXED - HTML support enabled
3. **API Routing**: ❌ PENDING - Need to implement proper development endpoint
4. **Props Handling**: ✅ FIXED - Invalid props removed
5. **Command Processing**: ❌ PENDING - Need to implement proper streaming response handling

The main remaining issue is the API endpoint configuration and implementation. Once this is fixed, all AI features should work as expected.
