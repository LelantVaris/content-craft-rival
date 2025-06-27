
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Edit, Trash2, Send } from 'lucide-react'
import { ScheduledArticle } from './CalendarState'

interface ContentPreviewCardProps {
  article: ScheduledArticle
  onEdit: (article: ScheduledArticle) => void
  onReschedule: (article: ScheduledArticle) => void
  onPublish: (article: ScheduledArticle) => void
  onDelete: (articleId: string) => void
}

export function ContentPreviewCard({ 
  article, 
  onEdit, 
  onReschedule, 
  onPublish, 
  onDelete 
}: ContentPreviewCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="w-full max-w-sm border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
              {article.title}
            </h3>
            <Badge variant="outline" className={getStatusColor(article.status)}>
              {article.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {article.scheduledDate.toLocaleDateString()}
          </div>
          
          {article.metaDescription && (
            <p className="text-xs text-slate-600 line-clamp-2">
              {article.metaDescription}
            </p>
          )}
          
          <div className="flex gap-1 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(article)}
              className="flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReschedule(article)}
            >
              <Calendar className="w-3 h-3" />
            </Button>
            
            {article.status !== 'published' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPublish(article)}
                className="text-green-600 hover:text-green-700"
              >
                <Send className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(article.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
