
import { cn } from "@/lib/utils";
import { EditorBubbleItem, useEditor } from "novel";
import { Bold, Italic, Underline, Strikethrough, Code } from "lucide-react";
import type { SelectorItem } from "./NodeSelector";
import { Button } from "@/components/ui/button";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor?.isActive("bold") || false,
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      icon: Bold,
    },
    {
      name: "italic",
      isActive: (editor) => editor?.isActive("italic") || false,
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      icon: Italic,
    },
    {
      name: "underline",
      isActive: (editor) => editor?.isActive("underline") || false,
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      icon: Underline,
    },
    {
      name: "strike",
      isActive: (editor) => editor?.isActive("strike") || false,
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      icon: Strikethrough,
    },
    {
      name: "code",
      isActive: (editor) => editor?.isActive("code") || false,
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      icon: Code,
    },
  ];

  return (
    <div className="flex">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button size="icon" className="rounded-none" variant="ghost">
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
