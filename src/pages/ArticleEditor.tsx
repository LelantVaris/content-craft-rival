
import { useState, useEffect } from "react"
import ArticleEditorHeader from "@/components/ArticleEditor/ArticleEditorHeader"
import ArticleTitle from "@/components/ArticleEditor/ArticleTitle"
import ContentEditor from "@/components/ArticleEditor/ContentEditor"
import AISuggestions from "@/components/ArticleEditor/AISuggestions"
import SEOScorePanel from "@/components/ArticleEditor/SEOScorePanel"
import ArticleStatsPanel from "@/components/ArticleEditor/ArticleStatsPanel"
import PublishingPanel from "@/components/ArticleEditor/PublishingPanel"

interface ArticleEditorProps {
  initialTitle?: string;
  initialContent?: string;
}

const ArticleEditor = ({ initialTitle, initialContent }: ArticleEditorProps = {}) => {
  const [title, setTitle] = useState(initialTitle || "10 Best Practices for Content Marketing in 2024")
  const [content, setContent] = useState(initialContent || `# Introduction

Content marketing continues to evolve rapidly in 2024, with new technologies and changing consumer behaviors reshaping how brands connect with their audiences. In this comprehensive guide, we'll explore the most effective strategies that are driving results for businesses today.

## 1. AI-Powered Content Personalization

Artificial intelligence is revolutionizing how we create and deliver personalized content experiences...

## 2. Video-First Content Strategy

Video content consumption has reached an all-time high, with platforms like TikTok, YouTube Shorts, and Instagram Reels dominating engagement metrics...

## 3. Interactive Content Elements

Interactive content generates 2x more engagement than passive content. Consider incorporating:

- Polls and surveys
- Interactive infographics
- Quizzes and assessments
- Calculators and tools

## 4. Voice Search Optimization

With the rise of smart speakers and voice assistants, optimizing for voice search is crucial...

`)

  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [seoScore, setSeoScore] = useState(78)

  useEffect(() => {
    const words = content.trim().split(/\s+/).length
    setWordCount(words)
    setReadingTime(Math.ceil(words / 200)) // Average reading speed
  }, [content])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <ArticleEditorHeader />

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
