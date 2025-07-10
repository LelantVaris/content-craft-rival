import { Command, CommandInput } from "@/components/ui/command";
import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { useState } from "react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Magic from "../icons/Magic";
import CrazySpinner from "../icons/CrazySpinner";
import AICompletionCommands from "./AICompletionCommands";
import AISelectorCommands from "./AISelectorCommands";
import { useAiCompletion } from "@/hooks/useAiCompletion";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const { completion, isLoading, generateCompletion } = useAiCompletion();

  if (!editor) {
    return null;
  }

  const hasCompletion = completion.length > 0;

  const getSelectedText = () => {
    const slice = editor.state.selection.content();
    return editor.storage.markdown?.serializer?.serialize(slice.content) || editor.getText();
  };

  // Update this function to match the expected signature
  const handleComplete = async (text: string, { option, command }: { option: string; command?: string }) => {
    const success = await generateCompletion(text, { option, command });
    if (success && command) {
      setInputValue("");
    }
  };

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0" />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={() => {
                const text = completion || getSelectedText();
                handleComplete(text, {
                  option: "zap",
                  command: inputValue
                });
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands 
              onSelect={(value, option) => handleComplete(value, { option })} 
            />
          )}
        </>
      )}
    </Command>
  );
}
