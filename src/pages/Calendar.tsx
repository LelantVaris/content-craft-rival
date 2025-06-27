
import React from 'react'
import { CalendarProvider } from '@/components/ContentPlanner/CalendarState'
import { FullscreenCalendar } from '@/components/ContentPlanner/FullscreenCalendar'

const Calendar = () => {
  return (
    <CalendarProvider>
      <div className="h-screen w-full bg-white">
        <FullscreenCalendar />
      </div>
    </CalendarProvider>
  )
}

export default Calendar
