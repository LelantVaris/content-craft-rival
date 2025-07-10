import { EditorBubble, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { AISelector } from "./AISelector";
import { addAIHighlight, removeAIHighlight } from "novel";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerativeMenuSwitch = ({ children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open || !editor) {
      return;
    }
    // No direct call to removeAIHighlight if editor is null
  }, [open, editor]);


  if (!editor) {
    return null;
  }

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          if (editor) {
            removeAIHighlight(editor);
          }
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && <AISelector open={open} onOpenChange={onOpenChange} />}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => {
              if (!editor) return;
              const { from, to } = editor.state.selection;
              if (from !== to) {
                addAIHighlight(editor);
              }
              onOpenChange(true);
            }}
            size="sm"
          >
            <Wand2 className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
