import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Zap, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useCalendar, ScheduledArticle } from './CalendarState'
import { ContentSchedulingModal } from './ContentSchedulingModal'
import { ContentPreviewCard } from './ContentPreviewCard'
import { EnhancedCalendarCell } from './EnhancedCalendarCell'
import { BulkGenerationModal } from './BulkGenerationModal'
import { ReschedulingModal } from './ReschedulingModal'
import { format, addMonths, subMonths, addDays, startOfMonth } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export function FullscreenCalendar() {
  const navigate = useNavigate()
  const { 
    state, 
    dispatch, 
    saveScheduledArticle, 
    updateScheduledArticle, 
    deleteScheduledArticle, 
    saveBulkArticles 
  } = useCalendar()
  const { scheduledContent, selectedDate, currentMonth, loading } = state
  const [showSchedulingModal, setShowSchedulingModal] = useState(false)
  const [showBulkGenerationModal, setShowBulkGenerationModal] = useState(false)
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null)
  const [showReschedulingModal, setShowReschedulingModal] = useState(false)
  const [reschedulingArticle, setReschedulingArticle] = useState<ScheduledArticle | null>(null)

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

  const handleAddContent = (date: Date) => {
    setSchedulingDate(date)
    setShowSchedulingModal(true)
  }

  const handleScheduleContent = async (content: Omit<ScheduledArticle, 'id' | 'scheduledDate'>) => {
    if (!schedulingDate) return

    const newArticle: ScheduledArticle = {
      ...content,
      id: crypto.randomUUID(),
      scheduledDate: schedulingDate
    }

    // Save to database
    await saveScheduledArticle(newArticle)
  }

  const handleBulkContentGenerated = async (articles: ScheduledArticle[]) => {
    // Save all articles to database
    await saveBulkArticles(articles, {
      bulkGeneration: true,
      generatedAt: new Date().toISOString()
    })
  }

  const handleEditArticle = (article: ScheduledArticle) => {
    navigate(`/article/${article.id}/edit`, {
      state: { 
        fromCalendar: true,
        calendarDate: article.scheduledDate,
        article: article 
      }
    })
  }

  const handleRescheduleArticle = async (article: ScheduledArticle) => {
    setReschedulingArticle(article)
    setShowReschedulingModal(true)
  }

  const handleConfirmReschedule = async (newDate: Date) => {
    if (!reschedulingArticle) return
    
    await updateScheduledArticle(reschedulingArticle.id, { 
      scheduledDate: newDate 
    })
    
    setShowReschedulingModal(false)
    setReschedulingArticle(null)
  }

  const handlePublishArticle = async (article: ScheduledArticle) => {
    await updateScheduledArticle(article.id, { status: 'published' })
  }

  const handleDeleteArticle = async (articleId: string) => {
    await deleteScheduledArticle(articleId)
  }

  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : []
  const totalScheduledArticles = Object.values(scheduledContent).flat().length

  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg text-gray-700">Loading calendar...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Content Planner</h1>
            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              {totalScheduledArticles} articles scheduled
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowBulkGenerationModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:opacity-90"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate 30 Days
            </Button>
            <Button 
              onClick={() => handleAddContent(new Date())}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Section */}
        <div className="flex-1 p-6">
          <Card className="h-full bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-4">
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
              </div>
            </CardHeader>
            
            <CardContent className="h-[calc(100%-80px)] overflow-auto">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 42 }, (_, i) => {
                  const date = addDays(startOfMonth(currentMonth), i - startOfMonth(currentMonth).getDay())
                  const articles = getContentForDate(date)
                  
                  return (
                    <EnhancedCalendarCell
                      key={i}
                      date={date}
                      currentMonth={currentMonth}
                      isSelected={selectedDate ? format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') : false}
                      scheduledArticles={articles}
                      onDateClick={handleDateSelect}
                      onAddContent={handleAddContent}
                    />
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-96 p-6 bg-white border-l border-gray-200">
          <Card className="h-full bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 h-[calc(100%-80px)] overflow-auto">
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
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No content scheduled</p>
                    <Button 
                      onClick={() => handleAddContent(selectedDate)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Content
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Select a date to view content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContentSchedulingModal
        isOpen={showSchedulingModal}
        onClose={() => setShowSchedulingModal(false)}
        selectedDate={schedulingDate}
        onScheduleContent={handleScheduleContent}
      />

      <BulkGenerationModal
        isOpen={showBulkGenerationModal}
        onClose={() => setShowBulkGenerationModal(false)}
        currentMonth={currentMonth}
        onContentGenerated={handleBulkContentGenerated}
      />

      {showReschedulingModal && reschedulingArticle && (
        <ReschedulingModal
          isOpen={showReschedulingModal}
          onClose={() => setShowReschedulingModal(false)}
          article={reschedulingArticle}
          onConfirm={handleConfirmReschedule}
        />
      )}
    </div>
  )
}
