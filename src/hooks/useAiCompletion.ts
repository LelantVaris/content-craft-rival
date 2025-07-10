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
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const generateCompletion = async (text: string, options: CompletionOptions) => {
    try {
      // @ts-expect-error - ai/react types are incomplete
      return await completion.complete(text, { body: options });
    } catch (error) {
      console.error("AI completion error:", error);
      toast.error("Failed to generate completion");
      return false;
    }
  };

  return {
    completion: completion.completion,
    isLoading: completion.isLoading,
    generateCompletion,
  };
} 