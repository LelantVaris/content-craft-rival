
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScheduledArticle } from '@/components/ContentPlanner/CalendarState';
import { format } from 'date-fns';

export interface CalendarArticle {
  id: string;
  title: string;
  content: string | null;
  scheduled_date: string;
  status: string;
  meta_description: string | null;
  keywords: string[] | null;
  calendar_generated: boolean;
  generation_batch_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useCalendarPersistence() {
  const [loading, setLoading] = useState(true);
  const [scheduledContent, setScheduledContent] = useState<Record<string, ScheduledArticle[]>>({});

  const fetchScheduledContent = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setScheduledContent({});
        return;
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.user.id)
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled content:', error);
        toast.error('Failed to load scheduled content');
        return;
      }

      // Transform database articles to ScheduledArticle format and group by date
      const contentByDate: Record<string, ScheduledArticle[]> = {};
      
      data?.forEach((article: CalendarArticle) => {
        const scheduledArticle: ScheduledArticle = {
          id: article.id,
          title: article.title,
          content: article.content || '',
          scheduledDate: new Date(article.scheduled_date),
          status: article.status as 'draft' | 'scheduled' | 'published',
          metaDescription: article.meta_description || undefined,
          keywords: article.keywords || undefined
        };

        const dateKey = article.scheduled_date;
        if (!contentByDate[dateKey]) {
          contentByDate[dateKey] = [];
        }
        contentByDate[dateKey].push(scheduledArticle);
      });

      setScheduledContent(contentByDate);
    } catch (error) {
      console.error('Error in fetchScheduledContent:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveScheduledArticle = useCallback(async (article: ScheduledArticle) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please log in to save articles');
        return null;
      }

      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          scheduled_date: format(article.scheduledDate, 'yyyy-MM-dd'),
          status: article.status,
          meta_description: article.metaDescription,
          keywords: article.keywords,
          calendar_generated: true,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving scheduled article:', error);
        toast.error('Failed to save article');
        return null;
      }

      // Update local state
      const dateKey = format(article.scheduledDate, 'yyyy-MM-dd');
      setScheduledContent(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), article]
      }));

      return data;
    } catch (error) {
      console.error('Error in saveScheduledArticle:', error);
      toast.error('Failed to save article');
      return null;
    }
  }, []);

  const updateScheduledArticle = useCallback(async (articleId: string, updates: Partial<ScheduledArticle>) => {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.status) updateData.status = updates.status;
      if (updates.metaDescription !== undefined) updateData.meta_description = updates.metaDescription;
      if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
      if (updates.scheduledDate) updateData.scheduled_date = format(updates.scheduledDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', articleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating scheduled article:', error);
        toast.error('Failed to update article');
        return;
      }

      // Refresh the data to ensure consistency
      await fetchScheduledContent();
      
      toast.success('Article updated successfully');
    } catch (error) {
      console.error('Error in updateScheduledArticle:', error);
      toast.error('Failed to update article');
    }
  }, [fetchScheduledContent]);

  const deleteScheduledArticle = useCallback(async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        console.error('Error deleting scheduled article:', error);
        toast.error('Failed to delete article');
        return;
      }

      // Update local state
      setScheduledContent(prev => {
        const newContent = { ...prev };
        for (const dateKey in newContent) {
          newContent[dateKey] = newContent[dateKey].filter(article => article.id !== articleId);
          if (newContent[dateKey].length === 0) {
            delete newContent[dateKey];
          }
        }
        return newContent;
      });

      toast.success('Article deleted successfully');
    } catch (error) {
      console.error('Error in deleteScheduledArticle:', error);
      toast.error('Failed to delete article');
    }
  }, []);

  const saveBulkArticles = useCallback(async (articles: ScheduledArticle[], batchOptions?: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please log in to save articles');
        return [];
      }

      // Create generation batch record
      const { data: batch, error: batchError } = await supabase
        .from('content_generation_batches')
        .insert({
          user_id: user.user.id,
          start_date: format(articles[0]?.scheduledDate || new Date(), 'yyyy-MM-dd'),
          end_date: format(articles[articles.length - 1]?.scheduledDate || new Date(), 'yyyy-MM-dd'),
          total_articles: articles.length,
          completed_articles: articles.length,
          status: 'completed',
          generation_options: batchOptions
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating generation batch:', batchError);
      }

      // Insert all articles
      const articlesData = articles.map(article => ({
        title: article.title,
        content: article.content,
        scheduled_date: format(article.scheduledDate, 'yyyy-MM-dd'),
        status: article.status,
        meta_description: article.metaDescription,
        keywords: article.keywords,
        calendar_generated: true,
        generation_batch_id: batch?.id,
        user_id: user.user.id
      }));

      const { data, error } = await supabase
        .from('articles')
        .insert(articlesData)
        .select();

      if (error) {
        console.error('Error saving bulk articles:', error);
        toast.error('Failed to save some articles');
        return [];
      }

      // Refresh the calendar data
      await fetchScheduledContent();
      
      toast.success(`Successfully saved ${data?.length || 0} articles`);
      return data || [];
    } catch (error) {
      console.error('Error in saveBulkArticles:', error);
      toast.error('Failed to save articles');
      return [];
    }
  }, [fetchScheduledContent]);

  useEffect(() => {
    fetchScheduledContent();
  }, [fetchScheduledContent]);

  return {
    scheduledContent,
    loading,
    saveScheduledArticle,
    updateScheduledArticle,
    deleteScheduledArticle,
    saveBulkArticles,
    refreshScheduledContent: fetchScheduledContent
  };
}
