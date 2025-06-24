
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NovelEditor } from "@/components/NovelEditor"
import { Zap } from "lucide-react"

interface ContentEditorProps {
  content: string
  setContent: (content: string) => void
  wordCount: number
  readingTime: number
}

const ContentEditor = ({ content, setContent, wordCount, readingTime }: ContentEditorProps) => {
  return (
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
  )
}

export default ContentEditor
