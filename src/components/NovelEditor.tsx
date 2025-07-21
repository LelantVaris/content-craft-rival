
import { 
  EditorRoot, 
  EditorContent, 
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandList,
  EditorCommandItem,
  type JSONContent 
} from "novel";
import { useState, useCallback } from "react";
import { defaultExtensions } from "./NovelEditor/extensions";
import { slashCommand } from "./NovelEditor/slashCommand";
import { suggestionItems } from "./NovelEditor/suggestionItems";
import { NodeSelector } from "./NovelEditor/NodeSelector";
import { LinkSelector } from "./NovelEditor/LinkSelector";
import { TextButtons } from "./NovelEditor/TextButtons";
import { ColorSelector } from "./NovelEditor/ColorSelector";
import { Separator } from "@/components/ui/separator";
import GenerativeMenuSwitch from "./NovelEditor/generative/GenerativeMenuSwitch";

interface NovelEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export const NovelEditor = ({ content, onChange, className }: NovelEditorProps) => {
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Combine default extensions with slash command
  const extensions = [...defaultExtensions, slashCommand];

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
          Rich text editor with AI-powered assistance
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
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-[600px] p-4",
            },
          }}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
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

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};
