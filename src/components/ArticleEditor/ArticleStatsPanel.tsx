
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp } from "lucide-react"

interface ArticleStatsPanelProps {
  wordCount: number
  readingTime: number
}

const ArticleStatsPanel = ({ wordCount, readingTime }: ArticleStatsPanelProps) => {
  return (
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
  )
}

export default ArticleStatsPanel
