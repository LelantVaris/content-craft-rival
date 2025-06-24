
import { 
  EditorRoot, 
  EditorContent, 
  type JSONContent 
} from "novel";
import { useState, useCallback } from "react";
import { defaultExtensions } from "./NovelEditor/extensions";

interface NovelEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export const NovelEditor = ({ content, onChange, className }: NovelEditorProps) => {
  const [saveStatus, setSaveStatus] = useState("Saved");

  // Simple debounced update handler
  const handleUpdate = useCallback(({ editor }: { editor: any }) => {
    try {
      setSaveStatus("Saving...");
      const text = editor.getText();
      onChange(text);
      
      // Simple timeout for save status
      setTimeout(() => {
        setSaveStatus("Saved");
      }, 500);
    } catch (error) {
      console.error("Editor update error:", error);
      setSaveStatus("Error");
    }
  }, [onChange]);

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

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Rich text editor
        </div>
        <div className="text-sm text-muted-foreground">
          {saveStatus}
        </div>
      </div>
      
      <EditorRoot>
        <EditorContent
          initialContent={getInitialContent()}
          extensions={defaultExtensions}
          onUpdate={handleUpdate}
          className="min-h-[600px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          editorProps={{
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-[600px] p-4",
            },
          }}
        />
      </EditorRoot>
    </div>
  );
};
