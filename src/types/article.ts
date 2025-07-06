
import { z } from 'zod';

// Schema for structured article content
export const ArticleContentSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    wordCount: z.number().optional(),
  })),
  totalWordCount: z.number().optional(),
  readingTime: z.number().optional(),
  metadata: z.object({
    tone: z.string().optional(),
    audience: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export type ArticleContent = z.infer<typeof ArticleContentSchema>;

export interface StreamingProgress {
  currentSection: number;
  totalSections: number;
  wordsGenerated: number;
  targetWords: number;
  status: string;
}
