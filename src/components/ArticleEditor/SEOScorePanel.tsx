
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, CheckCircle2, AlertCircle } from "lucide-react"

interface SEOScorePanelProps {
  seoScore: number
}

const SEOScorePanel = ({ seoScore }: SEOScorePanelProps) => {
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

  return (
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
  )
}

export default SEOScorePanel
