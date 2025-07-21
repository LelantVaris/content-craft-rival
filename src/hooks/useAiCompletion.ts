
import { useCompletion } from 'ai/react';
import { getAiEndpoint, getAiHeaders } from '@/utils/aiConfig';
import { toast } from 'sonner';

interface CompletionOptions {
  option: string;
  command?: string;
}

export function useAiCompletion() {
  const completion = useCompletion({
    api: getAiEndpoint(),
    headers: getAiHeaders(),
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
      if (!response.ok) {
        toast.error("Failed to generate completion");
        return;
      }
    },
    onError: (e) => {
      console.error("AI completion error:", e);
      toast.error(e.message || "Failed to generate completion");
    },
  });

  const generateCompletion = async (text: string, options: CompletionOptions) => {
    try {
      await completion.complete(text, { 
        body: { 
          prompt: text, 
          option: options.option,
          command: options.command
        } 
      });
      return true;
    } catch (error) {
      console.error("AI completion error:", error);
      toast.error("Failed to generate completion");
      return false;
    }
  };

  return {
    completion: completion.completion || "",
    isLoading: completion.isLoading,
    generateCompletion,
  };
}
