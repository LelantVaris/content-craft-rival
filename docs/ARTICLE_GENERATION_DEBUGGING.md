# Novel Editor AI Features Debugging Guide

## Issue: AI Features Not Working - Multiple Errors

### Problem Description
The Novel editor AI features are experiencing multiple critical errors:
1. `TypeError: Cannot read properties of undefined (reading 'serializer')`
2. `Duplicate extension names found: ['image', 'codeBlock']`
3. Missing required hooks and functions from the original Novel implementation

### Root Cause Analysis
- **Missing Markdown Extension**: The core issue is that `editor.storage.markdown.serializer` doesn't exist because the Markdown extension is not properly configured
- **Extension Conflicts**: Duplicate Tiptap extensions are causing conflicts in the editor setup
- **Missing Dependencies**: Several hooks and functions from the original Novel implementation are missing
- **Import Path Issues**: Some components are trying to import from paths that don't exist

### Console Log Evidence
```
Uncaught TypeError: Cannot read properties of undefined (reading 'serializer')
    at Object.onSelect (index-CnP3iuO-.js:1032:20542)
    
[tiptap warn]: Duplicate extension names found: ['image', 'codeBlock']. This can lead to issues.
```

### Debug Status
✅ API route `/api/generate` is working correctly with proper OpenAI integration
✅ Rate limiting and error handling implemented
❌ Editor storage for markdown serialization is undefined
❌ Duplicate extensions causing conflicts
❌ Missing required hooks and functions

## Comprehensive Fix Plan

### Phase 1: Add Missing Dependencies ⭐ URGENT

#### Step 1.1: Add useLocalStorage Hook
Create the missing hook that the original Novel implementation relies on:

```typescript
// File: src/hooks/useLocalStorage.ts
import { useEffect, useState } from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    // Retrieve from localStorage
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue = (value: T) => {
    // Save state
    setStoredValue(value);
    // Save to localStorage
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [storedValue, setValue];
};

export default useLocalStorage;
```

#### Step 1.2: Add Markdown Extension
The critical missing piece - add the Markdown extension to the extensions configuration:

```typescript
// In src/components/NovelEditor/extensions.ts
import {
  // ... existing imports
  Markdown, // ADD THIS IMPORT
} from "novel";

// Add to defaultExtensions array
export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  HighlightExtension,
  textStyle,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  Markdown.configure({
    html: false,
    transformCopiedText: false,
  }), // ADD THIS LINE
];
```

#### Step 1.3: Add addAIHighlight Function
Import and use the missing `addAIHighlight` function:

```typescript
// In src/components/NovelEditor/generative/AISelector.tsx
import { addAIHighlight } from "novel"; // ADD THIS IMPORT

// In the CommandInput component, add onFocus:
<CommandInput
  value={inputValue}
  onValueChange={setInputValue}
  autoFocus
  placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
  onFocus={() => addAIHighlight(editor)} // ADD THIS LINE
/>
```

### Phase 2: Fix Extension Conflicts

#### Step 2.1: Remove Duplicate Extensions
Choose one code block extension to avoid conflicts:

```typescript
// In src/components/NovelEditor/extensions.ts
const starterKit = StarterKit.configure({
  // ... existing config
  codeBlock: false, // DISABLE StarterKit's codeBlock
  // ... rest of config
});

// Keep CodeBlockLowlight as the primary code block extension
// Remove any other codeBlock configurations
```

### Phase 3: Update AI Components

#### Step 3.1: Fix AISelectorCommands
Ensure the serializer is properly accessed:

```typescript
// In src/components/NovelEditor/generative/AISelectorCommands.tsx
const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              const slice = editor.state.selection.content();
              // Use optional chaining to prevent errors
              const text = editor.storage.markdown?.serializer?.serialize(slice.content) || editor.getText();
              onSelect(text, value);
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      {/* ... rest of component */}
    </>
  );
};
```

#### Step 3.2: Fix AISelector Component
Add fallback for serializer and ensure proper text extraction:

```typescript
// In src/components/NovelEditor/generative/AISelector.tsx
<Button
  size="icon"
  className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
  onClick={() => {
    if (completion) {
      return complete(completion, {
        body: { option: "zap", command: inputValue },
      }).then(() => setInputValue(""));
    }

    const slice = editor.state.selection.content();
    // Add fallback for when serializer is not available
    const text = editor.storage.markdown?.serializer?.serialize(slice.content) || editor.getText();

    complete(text, {
      body: { option: "zap", command: inputValue },
    }).then(() => setInputValue(""));
  }}
>
  <ArrowUp className="h-4 w-4" />
</Button>
```

### Phase 4: Verify API Configuration

#### Current API Setup (Already Working)
```typescript
// src/api/generate.ts - This is already correctly implemented
export async function POST(req: Request): Promise<Response> {
  // Check if the OPENAI_API_KEY is set, if not return 400
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return new Response("Missing OPENAI_API_KEY - make sure to add it to your .env file.", {
      status: 400,
    });
  }
  
  // Rate limiting with KV store
  // Message handling with ts-pattern
  // OpenAI streaming with AI SDK
  
  const result = await streamText({
    prompt: messages[messages.length - 1].content,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    model: openai("gpt-4o-mini"),
  });

  return result.toDataStreamResponse();
}
```

## Implementation Priority
1. **Phase 1** - Add missing dependencies (15 minutes)
   - useLocalStorage hook
   - Markdown extension 
   - addAIHighlight function
2. **Phase 2** - Fix extension conflicts (5 minutes)
   - Remove duplicate codeBlock
3. **Phase 3** - Update AI components (10 minutes)
   - Add fallbacks for serializer
   - Update import paths
4. **Phase 4** - Test functionality (10 minutes)
   - Test all AI commands
   - Verify no console errors

## Expected Results After Fix
- ✅ "Make shorter" and "Make longer" commands work without errors
- ✅ Text selection and AI completion function properly
- ✅ No serializer undefined errors
- ✅ No duplicate extension warnings
- ✅ All AI features functional like the original Novel implementation

## Testing Checklist
- [ ] Select text and click "Ask AI"
- [ ] Try "Make shorter" command
- [ ] Try "Make longer" command  
- [ ] Try "Improve writing" command
- [ ] Try "Fix grammar" command
- [ ] Try "Continue writing" command
- [ ] Verify no console errors
- [ ] Test custom AI prompts with "zap" functionality

## Key Differences from Original
The main differences between our implementation and the working Novel example:
1. **Missing Markdown extension** - This is the critical piece that provides the serializer
2. **Missing addAIHighlight function** - Provides visual feedback when AI mode is active
3. **Extension conflicts** - Duplicate extensions causing editor instability
4. **Import path differences** - Some components reference different UI paths

All of these issues can be resolved by following the step-by-step plan above.
