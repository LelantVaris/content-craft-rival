
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, BookOpen, Target } from 'lucide-react'
import { format } from 'date-fns'
import { ScheduledArticle } from './CalendarState'

interface ContentSchedulingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  onScheduleContent: (content: Omit<ScheduledArticle, 'id' | 'scheduledDate'>) => void
}

export function ContentSchedulingModal({
  isOpen,
  onClose,
  selectedDate,
  onScheduleContent
}: ContentSchedulingModalProps) {
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('blog-post')
  const [metaDescription, setMetaDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)

    const content: Omit<ScheduledArticle, 'id' | 'scheduledDate'> = {
      title: title.trim(),
      content: '', // Will be generated later
      status: 'draft',
      metaDescription: metaDescription.trim() || undefined,
      keywords: keywordArray.length > 0 ? keywordArray : undefined
    }

    onScheduleContent(content)
    
    // Reset form
    setTitle('')
    setContentType('blog-post')
    setMetaDescription('')
    setKeywords('')
    setTargetAudience('')
    onClose()
  }

  const handleGenerateContent = () => {
    setIsGenerating(true)
    // TODO: Integrate with Article Studio content generation
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Schedule Content for {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Selected Date'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Article Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog-post">Blog Post</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="news">News Article</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief description for SEO (optional)..."
              rows={2}
              maxLength={160}
            />
            <div className="text-xs text-gray-500">
              {metaDescription.length}/160 characters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3..."
              />
              <div className="text-xs text-gray-500">
                Separate keywords with commas
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Audience
              </Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Marketing professionals..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGenerateContent}
              disabled={!title.trim() || isGenerating}
              className="flex-1"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate & Schedule'}
            </Button>
            <Button type="submit" disabled={!title.trim()} className="flex-1">
              Schedule Draft
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
