// supabase/functions/types.d.ts
declare module "jsr:@openai/openai" {
  export default class OpenAI {
    constructor(config: { apiKey: string });
    chat: {
      completions: {
        create(options: {
          model: string;
          temperature: number;
          stream: boolean;
          messages: Array<{ role: string; content: string }>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }): Promise<any>;
      };
    };
  }
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};
