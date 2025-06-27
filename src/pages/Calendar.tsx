
import React from 'react'
import { CalendarProvider } from '@/components/ContentPlanner/CalendarState'
import { FullPageCalendar } from '@/components/ContentPlanner/FullPageCalendar'
import { Button } from '@/components/ui/button'
import { Plus, Zap, Filter } from 'lucide-react'

const Calendar = () => {
  const handleGenerateBulkContent = () => {
    console.log('Generate 30 days of content')
    // TODO: Implement bulk content generation
  }

  return (
    <CalendarProvider>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Content Planner
            </h1>
            <p className="text-slate-600 mt-1">Plan, schedule, and publish your content strategy</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={handleGenerateBulkContent}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate 30 Days
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Content
            </Button>
          </div>
        </div>

        {/* Full Page Calendar */}
        <div className="h-[calc(100vh-12rem)]">
          <FullPageCalendar />
        </div>
      </div>
    </CalendarProvider>
  )
}

export default Calendar
