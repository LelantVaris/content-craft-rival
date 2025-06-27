
import React from 'react'
import { CalendarProvider } from '@/components/ContentPlanner/CalendarState'
import { FullscreenCalendar } from '@/components/ContentPlanner/FullscreenCalendar'

const Calendar = () => {
  return (
    <CalendarProvider>
      <FullscreenCalendar />
    </CalendarProvider>
  )
}

export default Calendar
