
import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import ArticleEditorHeader from "@/components/ArticleEditor/ArticleEditorHeader"
import ArticleTitle from "@/components/ArticleEditor/ArticleTitle"
import ContentEditor from "@/components/ArticleEditor/ContentEditor"
import AISuggestions from "@/components/ArticleEditor/AISuggestions"
import SEOScorePanel from "@/components/ArticleEditor/SEOScorePanel"
import ArticleStatsPanel from "@/components/ArticleEditor/ArticleStatsPanel"
import PublishingPanel from "@/components/ArticleEditor/PublishingPanel"
import { useArticles } from "@/hooks/useArticles"
import { useAutoSave } from "@/hooks/useAutoSave"
import { Tables } from "@/integrations/supabase/types"
import { toast } from "sonner"

interface ArticleEditorProps {
  initialTitle?: string
  initialContent?: string
  articleId?: string
}

type Article = Tables<'articles'>

const ArticleEditor = ({ initialTitle, initialContent }: ArticleEditorProps = {}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: urlArticleId } = useParams()
  const { saveArticle, updateArticle, articles } = useArticles()
  
  // Get article data from location state or find by ID
  const locationArticle = location.state as { title?: string; content?: string; article?: Article }
  const existingArticle = urlArticleId ? articles.find(a => a.id === urlArticleId) : null
  
  const [article, setArticle] = useState<Article | null>(existingArticle || null)
  const [title, setTitle] = useState(
    locationArticle?.title || existingArticle?.title || initialTitle || "Untitled Article"
  )
  const [content, setContent] = useState(
    locationArticle?.content || existingArticle?.content || initialContent || ""
  )
  const [isNew, setIsNew] = useState(!existingArticle && !urlArticleId)
  const [isSaving, setIsSaving] = useState(false)

  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [seoScore, setSeoScore] = useState(78)

  // Update state when articles load or URL changes
  useEffect(() => {
    if (urlArticleId && articles.length > 0) {
      const foundArticle = articles.find(a => a.id === urlArticleId)
      if (foundArticle && foundArticle !== existingArticle) {
        setArticle(foundArticle)
        setTitle(foundArticle.title)
        setContent(foundArticle.content || "")
        setIsNew(false)
      }
    }
  }, [urlArticleId, articles])

  // Auto-save functionality
  const saveData = async (data: { title: string; content: string }) => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      if (isNew || !article) {
        // Create new article
        const newArticle = await saveArticle({
          title: data.title,
          content: data.content,
          status: 'draft',
          content_type: 'blog-post',
          tone: 'professional',
        })
        setArticle(newArticle)
        setIsNew(false)
        
        // Update URL to reflect that we now have an article ID
        navigate(`/article/${newArticle.id}/edit`, { replace: true })
      } else {
        // Update existing article
        const updatedArticle = await updateArticle(article.id, {
          title: data.title,
          content: data.content,
        })
        setArticle(updatedArticle)
      }
    } finally {
      setIsSaving(false)
    }
  }

  useAutoSave({
    data: { title, content },
    onSave: saveData,
    enabled: title.trim() !== '' || content.trim() !== '',
  })

  // Manual save function
  const handleSave = async () => {
    await saveData({ title, content })
    toast.success('Article saved successfully')
  }

  useEffect(() => {
    const words = content.trim().split(/\s+/).length
    setWordCount(words)
    setReadingTime(Math.ceil(words / 200)) // Average reading speed
  }, [content])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <ArticleEditorHeader 
        onSave={handleSave}
        isSaving={isSaving}
        isNew={isNew}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          <ArticleTitle title={title} setTitle={setTitle} />
          <ContentEditor 
            content={content} 
            setContent={setContent}
            wordCount={wordCount}
            readingTime={readingTime}
          />
          <AISuggestions />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SEOScorePanel seoScore={seoScore} />
          <ArticleStatsPanel wordCount={wordCount} readingTime={readingTime} />
          <PublishingPanel />
        </div>
      </div>
    </div>
  )
}

export default ArticleEditor
