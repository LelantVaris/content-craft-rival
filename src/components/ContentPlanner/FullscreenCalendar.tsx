
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
    <div className="h-screen w-full bg-white flex flex-col">
      <div className="flex-1 p-6">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={handleDateSelect}
          month={currentMonth}
          onMonthChange={(month) => dispatch({ type: 'SET_CURRENT_MONTH', payload: month })}
          className="w-full h-full flex flex-col"
          classNames={{
            months: "flex-1 flex flex-col",
            month: "flex-1 flex flex-col space-y-6",
            caption: "flex justify-center pt-4 relative items-center",
            caption_label: "text-2xl font-semibold",
            nav: "space-x-4 flex items-center",
            nav_button: "h-12 w-12 bg-transparent p-0 opacity-70 hover:opacity-100 border border-gray-200 rounded-lg hover:bg-gray-50",
            table: "w-full flex-1 border-collapse",
            head_row: "flex w-full mb-4",
            head_cell: "text-gray-500 rounded-md w-full font-medium text-sm flex-1 text-center py-3",
            row: "flex w-full mb-2",
            cell: "text-center text-sm p-1 relative flex-1 min-h-[80px] border border-gray-100 hover:bg-gray-50 focus-within:relative focus-within:z-20",
            day: "h-full w-full p-3 font-normal hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 aria-selected:bg-blue-500 aria-selected:text-white rounded-md",
            day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
            day_today: "bg-blue-100 text-blue-800 font-semibold",
            day_outside: "text-gray-300 opacity-50",
            day_disabled: "text-gray-300 opacity-30",
            day_hidden: "invisible",
          }}
        />
      </div>
    </div>
  )
}
