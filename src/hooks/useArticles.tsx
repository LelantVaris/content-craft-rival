
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'
import { useWebsite } from '@/contexts/WebsiteContext'
import { toast } from 'sonner'

type Article = Tables<'articles'>
type ArticleInsert = TablesInsert<'articles'>
type ArticleUpdate = TablesUpdate<'articles'>

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { activeWebsite } = useWebsite()

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setArticles([])
        return
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch articles')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const saveArticle = async (articleData: Omit<ArticleInsert, 'user_id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('articles')
        .insert({
          ...articleData,
          user_id: user.user.id,
        })
        .select()
        .single()

      if (error) throw error
      
      setArticles(prev => [data, ...prev])
      toast.success('Article saved successfully')
      return data
    } catch (err) {
      console.error('Error saving article:', err)
      toast.error('Failed to save article')
      throw err
    }
  }

  const updateArticle = async (id: string, updates: ArticleUpdate) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setArticles(prev => prev.map(article => 
        article.id === id ? data : article
      ))
      
      return data
    } catch (err) {
      console.error('Error updating article:', err)
      toast.error('Failed to update article')
      throw err
    }
  }

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error

      setArticles(prev => prev.filter(article => article.id !== id))
      toast.success('Article deleted successfully')
    } catch (err) {
      console.error('Error deleting article:', err)
      toast.error('Failed to delete article')
      throw err
    }
  }

  const duplicateArticle = async (id: string) => {
    try {
      const original = articles.find(a => a.id === id)
      if (!original) throw new Error('Article not found')

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: `${original.title} (Copy)`,
          content: original.content,
          meta_description: original.meta_description,
          keywords: original.keywords,
          content_type: original.content_type,
          tone: original.tone,
          target_audience: original.target_audience,
          status: 'draft',
          user_id: user.user.id,
        })
        .select()
        .single()

      if (error) throw error

      setArticles(prev => [data, ...prev])
      toast.success('Article duplicated successfully')
      return data
    } catch (err) {
      console.error('Error duplicating article:', err)
      toast.error('Failed to duplicate article')
      throw err
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [activeWebsite])

  return {
    articles,
    loading,
    error,
    saveArticle,
    updateArticle,
    deleteArticle,
    duplicateArticle,
    refreshArticles: fetchArticles,
  }
}
