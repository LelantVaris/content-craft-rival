
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ArticleTitleProps {
  title: string
  setTitle: (title: string) => void
}

const ArticleTitle = ({ title, setTitle }: ArticleTitleProps) => {
  return (
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
  )
}

export default ArticleTitle
