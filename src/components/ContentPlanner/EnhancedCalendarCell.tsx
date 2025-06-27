
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import { format, isSameDay, isSameMonth } from 'date-fns'
import { ScheduledArticle } from './CalendarState'

interface EnhancedCalendarCellProps {
  date: Date
  currentMonth: Date
  isSelected: boolean
  scheduledArticles: ScheduledArticle[]
  onDateClick: (date: Date) => void
  onAddContent: (date: Date) => void
}

export function EnhancedCalendarCell({
  date,
  currentMonth,
  isSelected,
  scheduledArticles,
  onDateClick,
  onAddContent
}: EnhancedCalendarCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth)
  const isToday = isSameDay(date, new Date())
  const hasContent = scheduledArticles.length > 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div 
      className={`
        relative min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-sm
        ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'bg-white hover:bg-gray-50'}
        ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
        ${isToday ? 'border-purple-300 bg-purple-25' : 'border-gray-200'}
      `}
      onClick={() => onDateClick(date)}
    >
      {/* Date number */}
      <div className={`
        text-sm font-medium mb-2
        ${isToday ? 'text-purple-700 font-bold' : ''}
        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
      `}>
        {format(date, 'd')}
      </div>

      {/* Content */}
      <div className="space-y-1">
        {scheduledArticles.slice(0, 2).map((article, index) => (
          <div key={article.id} className="text-xs">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-gray-500" />
              <Badge 
                variant="outline" 
                className={`text-xs px-1 py-0 ${getStatusColor(article.status)}`}
              >
                {article.status}
              </Badge>
            </div>
            <div className="text-gray-700 line-clamp-2 leading-tight">
              {article.title}
            </div>
          </div>
        ))}

        {scheduledArticles.length > 2 && (
          <div className="text-xs text-gray-500 font-medium">
            +{scheduledArticles.length - 2} more
          </div>
        )}
      </div>

      {/* Add content button */}
      {isCurrentMonth && (
        <Button
          size="sm"
          variant="ghost"
          className={`
            absolute bottom-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity
            ${hasContent ? 'opacity-60 hover:opacity-100' : ''}
          `}
          onClick={(e) => {
            e.stopPropagation()
            onAddContent(date)
          }}
        >
          <Plus className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
