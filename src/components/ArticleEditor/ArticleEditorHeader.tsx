
import { Button } from "@/components/ui/button"
import { Eye, Share, Save } from "lucide-react"

const ArticleEditorHeader = () => {
  return (
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
  )
}

export default ArticleEditorHeader
