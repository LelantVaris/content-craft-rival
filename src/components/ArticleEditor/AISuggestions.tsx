
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

const AISuggestions = () => {
  const suggestions = [
    "Add more internal links to related articles",
    "Include data or statistics to support your claims",
    "Consider adding a FAQ section",
    "Optimize images with descriptive alt text",
    "Add a compelling call-to-action at the end"
  ]

  return (
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
  )
}

export default AISuggestions
