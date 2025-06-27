
import React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { useCalendar, ScheduledArticle } from './CalendarState'
import { ContentPreviewCard } from './ContentPreviewCard'
import { format, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns'

export function FullPageCalendar() {
  const { state, dispatch } = useCalendar()
  const { scheduledContent, selectedDate, viewMode, currentMonth } = state

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1)
    dispatch({ type: 'SET_CURRENT_MONTH', payload: newMonth })
  }

  const handleDateSelect = (date: Date | undefined) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date || null })
  }

  const getContentForDate = (date: Date): ScheduledArticle[] => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return scheduledContent[dateStr] || []
  }

  const handleEditArticle = (article: ScheduledArticle) => {
    console.log('Edit article:', article.id)
    // TODO: Open edit modal
  }

  const handleRescheduleArticle = (article: ScheduledArticle) => {
    console.log('Reschedule article:', article.id)
    // TODO: Open date picker modal
  }

  const handlePublishArticle = (article: ScheduledArticle) => {
    console.log('Publish article:', article.id)
    dispatch({ 
      type: 'UPDATE_SCHEDULED_CONTENT', 
      payload: { 
        articleId: article.id, 
        updates: { status: 'published' } 
      } 
    })
  }

  const handleDeleteArticle = (articleId: string) => {
    dispatch({ type: 'REMOVE_SCHEDULED_CONTENT', payload: { articleId } })
  }

  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : []

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Calendar Section */}
      <div className="flex-1">
        <Card className="h-full border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'month' })}
                >
                  Month
                </Button>
                <Button 
                  variant={viewMode === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'week' })}
                >
                  Week
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={(month) => dispatch({ type: 'SET_CURRENT_MONTH', payload: month })}
                className="w-full"
                components={{
                  Day: ({ date, ...props }) => {
                    const content = getContentForDate(date)
                    const hasContent = content.length > 0
                    const isSelected = selectedDate && isSameDay(date, selectedDate)
                    
                    return (
                      <div className="relative">
                        <button
                          {...props}
                          className={`
                            relative w-full h-16 p-1 text-sm border rounded-lg hover:bg-slate-50 transition-colors
                            ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'bg-white'}
                            ${!isSameMonth(date, currentMonth) ? 'text-slate-400 bg-slate-50' : ''}
                          `}
                        >
                          <div className="font-medium">{format(date, 'd')}</div>
                          {hasContent && (
                            <div className="absolute bottom-1 left-1 right-1">
                              <div className="flex gap-1 justify-center">
                                {content.slice(0, 3).map((article, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                      article.status === 'published' ? 'bg-green-500' :
                                      article.status === 'scheduled' ? 'bg-blue-500' :
                                      'bg-gray-400'
                                    }`}
                                  />
                                ))}
                                {content.length > 3 && (
                                  <div className="text-xs text-slate-500">+{content.length - 3}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Preview Section */}
      <div className="w-full lg:w-96">
        <Card className="h-full border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a Date'}
              </CardTitle>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="w-4 h-4 mr-1" />
                Add Content
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDate ? (
                selectedDateContent.length > 0 ? (
                  selectedDateContent.map((article) => (
                    <ContentPreviewCard
                      key={article.id}
                      article={article}
                      onEdit={handleEditArticle}
                      onReschedule={handleRescheduleArticle}
                      onPublish={handlePublishArticle}
                      onDelete={handleDeleteArticle}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No content scheduled for this date</p>
                    <Button size="sm" className="mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Schedule Content
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a date to view scheduled content</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
