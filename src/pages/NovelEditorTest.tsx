
import { useState } from "react";
import { NovelEditor } from "@/components/NovelEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const NovelEditorTest = () => {
  const [content, setContent] = useState("Start typing to test the Novel editor...");
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setWordCount(newContent.split(/\s+/).filter(word => word.length > 0).length);
  };

  const clearContent = () => {
    setContent("");
    setWordCount(0);
  };

  const loadSampleContent = () => {
    const sampleContent = `# Novel Editor Test

This is a **test document** for the Novel editor integration.

## Features to Test:
- **Bold text formatting**
- *Italic text formatting*
- ~~Strikethrough text~~
- \`Inline code\`

### List Testing:
1. First ordered item
2. Second ordered item
3. Third ordered item

- First bullet point
- Second bullet point
- Third bullet point

### Code Block Testing:
\`\`\`javascript
function testCode() {
  console.log("Testing code blocks");
}
\`\`\`

> This is a blockquote to test quotation formatting.

---

Testing horizontal rules and various formatting options.

### Task List Testing:
- [ ] Incomplete task
- [x] Completed task
- [ ] Another incomplete task`;
    
    setContent(sampleContent);
    setWordCount(sampleContent.split(/\s+/).filter(word => word.length > 0).length);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Novel Editor Test Page</h1>
          <p className="text-gray-600">Testing Novel editor integration with enhanced features</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            Words: {wordCount}
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Characters: {content.length}
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button onClick={loadSampleContent} variant="default">
            Load Sample Content
          </Button>
          <Button onClick={clearContent} variant="outline">
            Clear Content
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Novel Editor</CardTitle>
              <CardDescription>
                Test the Novel editor functionality, formatting, and extensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NovelEditor
                content={content}
                onChange={handleContentChange}
                className="min-h-[600px]"
              />
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Raw Content Output</CardTitle>
              <CardDescription>
                View the raw text output from the editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Content Preview:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Statistics:</h4>
                  <div className="space-y-2 text-sm">
                    <div>Word Count: <span className="font-mono">{wordCount}</span></div>
                    <div>Character Count: <span className="font-mono">{content.length}</span></div>
                    <div>Character Count (no spaces): <span className="font-mono">{content.replace(/\s/g, '').length}</span></div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Enhanced Features to Test:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Text formatting (bold, italic, strikethrough, underline)</li>
                    <li>Headings (H1, H2, H3)</li>
                    <li>Lists (ordered, unordered, and task lists)</li>
                    <li>Code blocks and inline code</li>
                    <li>Blockquotes</li>
                    <li>Horizontal rules</li>
                    <li>Image upload (type "/" and select "Image")</li>
                    <li>YouTube embeds (type "/" and select "Youtube")</li>
                    <li>Twitter embeds (type "/" and select "Twitter")</li>
                    <li>Bubble menu (select text to see formatting options)</li>
                    <li>Slash commands (type "/" to see all options)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Basic Testing:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Type text and verify it appears correctly</li>
                  <li>Test backspace and delete functionality</li>
                  <li>Test copy/paste operations</li>
                  <li>Verify auto-save status updates</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Slash Commands:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Type "/" to open command palette</li>
                  <li>Test text, headings, lists, quotes</li>
                  <li>Test code blocks and task lists</li>
                  <li>Test image upload functionality</li>
                  <li>Test YouTube and Twitter embeds</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Bubble Menu:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Select text to show bubble menu</li>
                  <li>Test bold, italic, underline</li>
                  <li>Test strikethrough and code</li>
                  <li>Test keyboard shortcuts (Ctrl+B, Ctrl+I)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovelEditorTest;
