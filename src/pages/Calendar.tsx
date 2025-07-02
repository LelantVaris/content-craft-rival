
import React from 'react'
import { CalendarProvider } from '@/components/ContentPlanner/CalendarState'
import { FullscreenCalendar } from '@/components/ContentPlanner/FullscreenCalendar'
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Calendar as CalendarIcon, Clock, Zap } from 'lucide-react';

const Calendar = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white sticky top-0 z-50">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Content Planner
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-blue-600" />
              <span>Schedule</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-600" />
              <span>Timeline</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-600" />
              <span>Auto-Planning</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <CalendarProvider>
          <FullscreenCalendar />
        </CalendarProvider>
      </div>
    </div>
  )
}

export default Calendar
