
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FileText, CheckCircle2 } from "lucide-react"

const PublishingPanel = () => {
  return (
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
  )
}

export default PublishingPanel
