
import React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { useCalendar } from './CalendarState'

export function FullscreenCalendar() {
  const { state, dispatch } = useCalendar()
  const { selectedDate, currentMonth } = state

  const handleDateSelect = (date: Date | undefined) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date || null })
  }

  return (
    <div className="h-screen w-full p-4">
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={handleDateSelect}
        month={currentMonth}
        onMonthChange={(month) => dispatch({ type: 'SET_CURRENT_MONTH', payload: month })}
        className="w-full h-full"
        classNames={{
          months: "flex w-full h-full",
          month: "space-y-4 w-full h-full",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100",
          table: "w-full h-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 p-2",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative flex-1 h-16 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-full w-full p-0 font-normal hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
      />
    </div>
  )
}
