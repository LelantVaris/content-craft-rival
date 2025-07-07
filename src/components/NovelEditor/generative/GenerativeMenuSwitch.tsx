
import { EditorBubble, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Magic from "../icons/Magic";
import { AISelector } from "./AISelector";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerativeMenuSwitch = ({ children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open) {
      // Remove any existing highlights when AI mode is closed
      editor.chain().unsetHighlight().run();
    }
  }, [open, editor]);

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          editor.chain().unsetHighlight().run();
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
              // Add highlight when opening AI mode
              const { from, to } = editor.state.selection;
              if (from !== to) {
                editor.chain().focus().setHighlight({ color: '#DDD6FE' }).run();
              }
              onOpenChange(true);
            }}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
