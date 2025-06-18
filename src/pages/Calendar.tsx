
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const mockEvents = [
  { id: 1, title: "AI Content Strategy Blog", date: "2025-01-20", status: "published", type: "blog" },
  { id: 2, title: "Social Media Campaign", date: "2025-01-22", status: "draft", type: "social" },
  { id: 3, title: "Product Launch Article", date: "2025-01-25", status: "scheduled", type: "blog" },
  { id: 4, title: "Newsletter Content", date: "2025-01-28", status: "draft", type: "newsletter" },
];

export default function Calendar() {
  const [currentDate] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-success text-success-foreground";
      case "scheduled": return "bg-info text-info-foreground";
      case "draft": return "bg-warning text-warning-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "blog": return "bg-primary text-primary-foreground";
      case "social": return "bg-info text-info-foreground";
      case "newsletter": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your content</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Content
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 2; // Start from previous month
                  const isCurrentMonth = day > 0 && day <= 31;
                  const hasEvent = mockEvents.some(event => 
                    new Date(event.date).getDate() === day
                  );
                  
                  return (
                    <div 
                      key={i} 
                      className={`
                        aspect-square p-2 text-sm border border-border hover:bg-accent cursor-pointer
                        ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'} 
                        ${hasEvent ? 'bg-primary/5' : 'bg-background'}
                      `}
                    >
                      <div className="font-medium">{isCurrentMonth ? day : ''}</div>
                      {hasEvent && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Content */}
        <div>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-foreground">Upcoming Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEvents.map(event => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-elevated mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">Content Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">12</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">8</div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Blog Posts</span>
                  <span className="text-foreground">6</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Social Media</span>
                  <span className="text-foreground">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Newsletters</span>
                  <span className="text-foreground">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
