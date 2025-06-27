
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScheduledArticle } from '@/components/ContentPlanner/CalendarState';
import { format, addDays } from 'date-fns';

export interface BulkGenerationRequest {
  startDate: Date;
  endDate: Date;
  contentTypes: string[];
  targetAudience: string;
  keywords: string[];
  tone: string;
  publishingSchedule: 'daily' | 'weekdays' | 'custom';
}

export interface ContentGenerationQueue {
  id: string;
  totalArticles: number;
  completedArticles: number;
  failedArticles: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedContent: ScheduledArticle[];
}

export function useCalendarContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationQueue, setGenerationQueue] = useState<ContentGenerationQueue | null>(null);

  const generateSingleArticle = useCallback(async (
    title: string,
    scheduledDate: Date,
    options: Partial<BulkGenerationRequest> = {}
  ): Promise<ScheduledArticle | null> => {
    try {
      console.log('Generating single article:', { title, scheduledDate, options });
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          keywords: options.keywords || [],
          audience: options.targetAudience || '',
          tone: options.tone || 'professional'
        }
      });

      if (error) {
        console.error('Content generation error:', error);
        toast.error(`Failed to generate content: ${error.message}`);
        return null;
      }

      if (!data || !data.content) {
        console.error('No content returned from generation');
        toast.error('No content was generated');
        return null;
      }

      const article: ScheduledArticle = {
        id: crypto.randomUUID(),
        title,
        content: data.content,
        scheduledDate,
        status: 'draft',
        metaDescription: data.metaDescription || `${title} - Generated content for ${format(scheduledDate, 'MMMM d, yyyy')}`,
        keywords: options.keywords
      };

      console.log('Successfully generated article:', article);
      return article;
    } catch (error) {
      console.error('Error generating single article:', error);
      toast.error('Failed to generate article content');
      return null;
    }
  }, []);

  const generateBulkContent = useCallback(async (
    request: BulkGenerationRequest,
    onProgress?: (progress: number, article?: ScheduledArticle) => void
  ): Promise<ScheduledArticle[]> => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const generatedArticles: ScheduledArticle[] = [];
    const { startDate, endDate, contentTypes, targetAudience, keywords, tone, publishingSchedule } = request;

    // Calculate dates to generate content for
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (publishingSchedule === 'weekdays') {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
          dates.push(new Date(currentDate));
        }
      } else {
        dates.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }

    const totalArticles = dates.length;
    
    // Initialize generation queue
    const queue: ContentGenerationQueue = {
      id: crypto.randomUUID(),
      totalArticles,
      completedArticles: 0,
      failedArticles: 0,
      status: 'processing',
      generatedContent: []
    };
    setGenerationQueue(queue);

    try {
      console.log(`Starting bulk generation for ${totalArticles} articles`);
      
      // Create a batch record in the database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data: batchRecord, error: batchError } = await supabase
        .from('content_generation_batches')
        .insert({
          user_id: user.user.id,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          total_articles: totalArticles,
          status: 'processing',
          generation_options: {
            contentTypes,
            targetAudience,
            keywords,
            tone,
            publishingSchedule
          }
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating batch record:', batchError);
      }

      // Generate content for each date
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const contentType = contentTypes[i % contentTypes.length] || 'blog-post';
        
        // Generate more diverse and specific topics
        const topicTemplates = [
          `${contentType}: Industry trends and insights for ${format(date, 'MMMM yyyy')}`,
          `${contentType}: Practical tips and best practices`,
          `${contentType}: Emerging technologies and innovations`,
          `${contentType}: Market analysis and expert predictions`,
          `${contentType}: Case studies and success stories`,
          `${contentType}: Common challenges and solutions`,
          `${contentType}: Future outlook and strategic planning`,
          `${contentType}: Tools and resources guide`
        ];
        
        const title = topicTemplates[i % topicTemplates.length];
        
        let currentArticle: ScheduledArticle | null = null;
        
        try {
          currentArticle = await generateSingleArticle(title, date, {
            targetAudience,
            keywords,
            tone
          });

          if (currentArticle) {
            generatedArticles.push(currentArticle);
            queue.completedArticles++;
            queue.generatedContent.push(currentArticle);
          } else {
            queue.failedArticles++;
            console.warn(`Failed to generate article for ${format(date, 'yyyy-MM-dd')}`);
          }
        } catch (error) {
          console.error(`Failed to generate article for ${format(date, 'yyyy-MM-dd')}:`, error);
          queue.failedArticles++;
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalArticles) * 100);
        setGenerationProgress(progress);
        
        if (onProgress) {
          onProgress(progress, currentArticle || undefined);
        }

        // Small delay to prevent API rate limiting and allow UI updates
        if (i < dates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update batch record
      if (batchRecord) {
        await supabase
          .from('content_generation_batches')
          .update({
            completed_articles: queue.completedArticles,
            failed_articles: queue.failedArticles,
            status: queue.failedArticles === 0 ? 'completed' : 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', batchRecord.id);
      }

      queue.status = 'completed';
      setGenerationQueue(queue);
      
      if (queue.completedArticles > 0) {
        toast.success(`Generated ${queue.completedArticles} articles successfully!`);
      }
      
      if (queue.failedArticles > 0) {
        toast.warning(`${queue.failedArticles} articles failed to generate`);
      }

    } catch (error) {
      console.error('Bulk generation failed:', error);
      queue.status = 'failed';
      setGenerationQueue(queue);
      toast.error('Bulk content generation failed');
    } finally {
      setIsGenerating(false);
    }

    return generatedArticles;
  }, [generateSingleArticle]);

  const cancelGeneration = useCallback(() => {
    setIsGenerating(false);
    setGenerationProgress(0);
    if (generationQueue) {
      setGenerationQueue({
        ...generationQueue,
        status: 'failed'
      });
    }
    toast.info('Content generation cancelled');
  }, [generationQueue]);

  return {
    isGenerating,
    generationProgress,
    generationQueue,
    generateSingleArticle,
    generateBulkContent,
    cancelGeneration
  };
}
