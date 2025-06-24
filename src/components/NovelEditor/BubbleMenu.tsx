
import { EditorBubble, EditorBubbleItem } from "novel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, Underline, Strikethrough, Code } from "lucide-react";

const BubbleMenu = () => {
  return (
    <EditorBubble
      tippyOptions={{
        placement: "top",
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      <EditorBubbleItem
        onSelect={(editor) => {
          editor.chain().focus().toggleBold().run();
        }}
        className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Button variant="ghost" size="sm">
          <Bold className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>

      <EditorBubbleItem
        onSelect={(editor) => {
          editor.chain().focus().toggleItalic().run();
        }}
        className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Button variant="ghost" size="sm">
          <Italic className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>

      <EditorBubbleItem
        onSelect={(editor) => {
          editor.chain().focus().toggleUnderline().run();
        }}
        className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Button variant="ghost" size="sm">
          <Underline className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>

      <EditorBubbleItem
        onSelect={(editor) => {
          editor.chain().focus().toggleStrike().run();
        }}
        className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Button variant="ghost" size="sm">
          <Strikethrough className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>

      <Separator orientation="vertical" />

      <EditorBubbleItem
        onSelect={(editor) => {
          editor.chain().focus().toggleCode().run();
        }}
        className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Button variant="ghost" size="sm">
          <Code className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>
    </EditorBubble>
  );
};

export default BubbleMenu;
