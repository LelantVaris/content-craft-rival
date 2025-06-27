
import React from 'react'
import { FullscreenCalendar as Calendar } from '@/components/ui/fullscreen-calendar'
import { useCalendar } from './CalendarState'

export function FullscreenCalendar() {
  const { state, dispatch } = useCalendar()
  const { selectedDate, currentMonth } = state

  const handleDateSelect = (date: Date | undefined) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date || null })
  }

  return (
    <div className="h-screen w-full">
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={handleDateSelect}
        month={currentMonth}
        onMonthChange={(month) => dispatch({ type: 'SET_CURRENT_MONTH', payload: month })}
      />
    </div>
  )
}
