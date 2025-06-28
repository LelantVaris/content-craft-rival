
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, Clock, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Tables } from "@/integrations/supabase/types"

type Article = Tables<'articles'>

interface ArticleEditorHeaderProps {
  onSave?: () => void
  isSaving?: boolean
  isNew?: boolean
  isFromCalendar?: boolean
  onBackToCalendar?: () => void
  article?: Article | null
}

const ArticleEditorHeader = ({ 
  onSave, 
  isSaving = false, 
  isNew = true, 
  isFromCalendar = false,
  onBackToCalendar,
  article
}: ArticleEditorHeaderProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (isFromCalendar && onBackToCalendar) {
      onBackToCalendar()
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isFromCalendar ? 'Back to Calendar' : 'Back to Dashboard'}
        </Button>
        
        <div className="h-6 w-px bg-gray-200" />
        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">
            {isNew ? "New Article" : "Edit Article"}
          </h1>
          
          {/* Calendar Context Badges */}
          {isFromCalendar && (
            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              <Calendar className="w-3 h-3 mr-1" />
              Calendar
            </Badge>
          )}
          
          {article?.calendar_generated && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              AI Generated
            </Badge>
          )}
          
          {isSaving && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saving...
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

export default ArticleEditorHeader
