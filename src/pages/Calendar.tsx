
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Link } from "react-router-dom"

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Mock data for calendar events
  const events = [
    {
      id: 1,
      title: "Publish: SEO Best Practices 2024",
      date: new Date(2024, 11, 20),
      type: "publish",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Review: AI Content Strategy",
      date: new Date(2024, 11, 22),
      type: "review",
      status: "pending"
    },
    {
      id: 3,
      title: "Keyword Research: E-commerce",
      date: new Date(2024, 11, 25),
      type: "research",
      status: "in-progress"
    },
    {
      id: 4,
      title: "Content Audit: Q4 Performance",
      date: new Date(2024, 11, 28),
      type: "audit",
      status: "upcoming"
    }
  ]

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'publish': return 'bg-green-100 text-green-800 border-green-200'
      case 'review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'research': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'audit': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Content Calendar
          </h1>
          <p className="text-slate-600 mt-1">Plan and schedule your content strategy</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link to="/article/new">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="border-0 bg-white/80 backdrop-blur">
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
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 border-b">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isToday = date && date.toDateString() === new Date().toDateString()
              
              return (
                <div 
                  key={index} 
                  className={`min-h-[120px] p-2 border border-slate-200 rounded-lg ${
                    date ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'
                  } ${isToday ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-purple-600' : 'text-slate-700'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} line-clamp-2`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Upcoming Content</CardTitle>
            <CardDescription>Your scheduled content for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-slate-500">
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge variant="secondary">
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Stats */}
        <Card className="border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Content planning overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Published</span>
                <span className="text-lg font-bold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Scheduled</span>
                <span className="text-lg font-bold text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">In Draft</span>
                <span className="text-lg font-bold text-orange-600">5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Ideas</span>
                <span className="text-lg font-bold text-purple-600">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Calendar
