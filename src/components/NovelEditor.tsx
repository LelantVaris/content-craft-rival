
import { 
  EditorRoot, 
  EditorContent, 
  EditorCommand, 
  EditorCommandItem, 
  EditorCommandEmpty,
  EditorCommandList,
  type JSONContent 
} from "novel";
import { useState, useEffect } from "react";
import { handleCommandNavigation } from "novel/extensions";
import { defaultExtensions } from "./NovelEditor/extensions";
import { slashCommand } from "./NovelEditor/slashCommand";
import { suggestionItems } from "./NovelEditor/suggestionItems";
import BubbleMenu from "./NovelEditor/BubbleMenu";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface NovelEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export const NovelEditor = ({ content, onChange, className }: NovelEditorProps) => {
  const [saveStatus, setSaveStatus] = useState("Saved");

  // Debounced update handler
  const debouncedUpdates = useDebouncedCallback((editor: any) => {
    const html = editor.getHTML();
    const text = editor.getText();
    onChange(text);
    setSaveStatus("Saved");
  }, 500);

  const handleUpdate = ({ editor }: { editor: any }) => {
    setSaveStatus("Saving...");
    debouncedUpdates(editor);
  };

  // Convert string content to JSONContent structure
  const getInitialContent = (): JSONContent => {
    if (!content || content.trim() === '') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: []
          }
        ]
      };
    }

    // For now, we'll treat the content as plain text
    // In a real implementation, you might want to parse HTML/Markdown
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: content
            }
          ]
        }
      ]
    };
  };

  // Combine all extensions
  const extensions = [...defaultExtensions, slashCommand];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Press '/' for commands
        </div>
        <div className="text-sm text-muted-foreground">
          {saveStatus}
        </div>
      </div>
      
      <EditorRoot>
        <EditorContent
          initialContent={getInitialContent()}
          extensions={extensions}
          onUpdate={handleUpdate}
          className="min-h-[600px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-[600px] p-4",
            },
          }}
        >
          {/* Slash Command Menu */}
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Bubble Menu */}
          <BubbleMenu />
        </EditorContent>
      </EditorRoot>
    </div>
  );
};
