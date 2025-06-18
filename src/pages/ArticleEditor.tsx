import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { NovelEditor } from "@/components/NovelEditor"
import { 
  Save, 
  Eye, 
  Share, 
  Target,
  TrendingUp,
  Clock,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react"

const ArticleEditor = () => {
  const [title, setTitle] = useState("10 Best Practices for Content Marketing in 2024")
  const [content, setContent] = useState(`# Introduction

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

  const seoChecks = [
    { item: "Primary keyword in title", status: "completed", score: 15 },
    { item: "Meta description optimized", status: "completed", score: 10 },
    { item: "Proper heading structure", status: "warning", score: 8 },
    { item: "Internal links added", status: "pending", score: 0 },
    { item: "External authoritative links", status: "completed", score: 12 },
    { item: "Image alt text", status: "pending", score: 0 },
    { item: "Content length (1500+ words)", status: "warning", score: 8 },
    { item: "Call-to-action included", status: "pending", score: 0 }
  ]

  const completedChecks = seoChecks.filter(check => check.status === "completed").length
  const totalChecks = seoChecks.length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-slate-400" />
      default: return null
    }
  }

  const suggestions = [
    "Add more internal links to related articles",
    "Include data or statistics to support your claims",
    "Consider adding a FAQ section",
    "Optimize images with descriptive alt text",
    "Add a compelling call-to-action at the end"
  ]

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Article Editor
          </h1>
          <p className="text-slate-600 mt-1">Write and optimize your content with AI assistance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title */}
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Article Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
                placeholder="Enter your article title..."
              />
            </CardContent>
          </Card>

          {/* Content Editor - Now using Novel */}
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Content</CardTitle>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{wordCount} words</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>
              <CardDescription>
                Write your content here. Use "/" for AI commands and rich text formatting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NovelEditor
                content={content}
                onChange={setContent}
                className="min-h-[600px]"
              />
              
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Rich Text</Badge>
                  <Badge variant="outline">AI-Powered</Badge>
                  <Badge variant="outline">Auto-save enabled</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  AI Assist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                AI Suggestions
              </CardTitle>
              <CardDescription>
                Improve your content with these AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Score */}
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                SEO Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">{seoScore}/100</div>
                <div className="text-sm text-slate-500">Good optimization</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completed checks</span>
                  <span>{completedChecks}/{totalChecks}</span>
                </div>
                
                <div className="space-y-2">
                  {seoChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <span>{check.item}</span>
                      </div>
                      <span className="font-medium">+{check.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Stats */}
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Article Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Word Count</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Reading Time</span>
                  <span className="font-medium">{readingTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Paragraphs</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Headings</span>
                  <span className="font-medium">8</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Readability</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Good
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Keyword Density</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    2.1%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Options */}
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Publication
                </Button>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                Last saved: 2 minutes ago
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ArticleEditor
