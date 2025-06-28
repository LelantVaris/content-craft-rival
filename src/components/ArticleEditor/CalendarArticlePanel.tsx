
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Zap } from "lucide-react"
import { Tables } from "@/integrations/supabase/types"
import { format } from "date-fns"
import { useCalendarPersistence } from "@/hooks/useCalendarPersistence"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Article = Tables<'articles'>

interface CalendarArticlePanelProps {
  article: Article
  onArticleUpdate: (article: Article) => void
}

const CalendarArticlePanel = ({ article, onArticleUpdate }: CalendarArticlePanelProps) => {
  const { updateScheduledArticle } = useCalendarPersistence()
  const [showRescheduling, setShowRescheduling] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    article.scheduled_date ? new Date(article.scheduled_date) : undefined
  )
  const [isRescheduling, setIsRescheduling] = useState(false)

  const handleReschedule = async (newDate: Date | undefined) => {
    if (!newDate || !article.id) return
    
    setIsRescheduling(true)
    try {
      await updateScheduledArticle(article.id, {
        scheduledDate: newDate
      })
      
      // Update local article state
      const updatedArticle = {
        ...article,
        scheduled_date: format(newDate, 'yyyy-MM-dd')
      }
      onArticleUpdate(updatedArticle)
      setShowRescheduling(false)
    } catch (error) {
      console.error('Failed to reschedule article:', error)
    } finally {
      setIsRescheduling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Calendar Article
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generation Info */}
        {article.calendar_generated && (
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700">AI Generated Content</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <Badge variant="outline" className={getStatusColor(article.status || 'draft')}>
            {article.status || 'draft'}
          </Badge>
        </div>

        {/* Scheduled Date */}
        {article.scheduled_date && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Scheduled for {format(new Date(article.scheduled_date), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Reschedule Button */}
            <Popover open={showRescheduling} onOpenChange={setShowRescheduling}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    if (date) {
                      handleReschedule(date)
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                {isRescheduling && (
                  <div className="p-3 text-center text-sm text-gray-600">
                    Rescheduling...
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Article Metadata */}
        {article.created_at && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Created: {format(new Date(article.created_at), 'MMM d, yyyy HH:mm')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CalendarArticlePanel
