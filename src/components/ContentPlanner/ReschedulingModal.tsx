
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScheduledArticle } from './CalendarState'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

interface ReschedulingModalProps {
  isOpen: boolean
  onClose: () => void
  article: ScheduledArticle
  onConfirm: (newDate: Date) => Promise<void>
}

export function ReschedulingModal({ isOpen, onClose, article, onConfirm }: ReschedulingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(article.scheduledDate)
  const [isRescheduling, setIsRescheduling] = useState(false)

  const handleConfirm = async () => {
    setIsRescheduling(true)
    try {
      await onConfirm(selectedDate)
      onClose()
    } catch (error) {
      console.error('Failed to reschedule article:', error)
    } finally {
      setIsRescheduling(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            Reschedule Article
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-1">{article.title}</h4>
            <p className="text-xs text-gray-500">
              Currently scheduled for {format(article.scheduledDate, 'MMM d, yyyy')}
            </p>
          </div>

          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div className="text-center text-sm text-gray-600">
            New date: {format(selectedDate, 'MMMM d, yyyy')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRescheduling}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isRescheduling || selectedDate.getTime() === article.scheduledDate.getTime()}
          >
            {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
