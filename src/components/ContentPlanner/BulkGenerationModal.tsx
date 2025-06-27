
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Zap, X, Target, Hash } from 'lucide-react';
import { format, addDays, startOfMonth } from 'date-fns';
import { BulkGenerationRequest, useCalendarContentGeneration } from '@/hooks/useCalendarContentGeneration';
import { ScheduledArticle } from './CalendarState';

interface BulkGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date;
  onContentGenerated: (articles: ScheduledArticle[]) => void;
}

export function BulkGenerationModal({
  isOpen,
  onClose,
  currentMonth,
  onContentGenerated
}: BulkGenerationModalProps) {
  const [startDate, setStartDate] = useState(format(startOfMonth(currentMonth), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState('30');
  const [contentTypes, setContentTypes] = useState(['blog-post']);
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [publishingSchedule, setPublishingSchedule] = useState<'daily' | 'weekdays' | 'custom'>('daily');

  const {
    isGenerating,
    generationProgress,
    generateBulkContent,
    cancelGeneration
  } = useCalendarContentGeneration();

  const handleGenerate = async () => {
    const start = new Date(startDate);
    const end = addDays(start, parseInt(duration) - 1);
    
    const request: BulkGenerationRequest = {
      startDate: start,
      endDate: end,
      contentTypes,
      targetAudience: targetAudience.trim(),
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
      tone,
      publishingSchedule
    };

    const generatedArticles = await generateBulkContent(request);
    
    if (generatedArticles.length > 0) {
      onContentGenerated(generatedArticles);
      onClose();
    }
  };

  const addContentType = (type: string) => {
    if (!contentTypes.includes(type)) {
      setContentTypes([...contentTypes, type]);
    }
  };

  const removeContentType = (type: string) => {
    setContentTypes(contentTypes.filter(t => t !== type));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Bulk Generate Content
          </DialogTitle>
        </DialogHeader>

        {isGenerating ? (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Generating Content...</div>
              <div className="text-sm text-gray-600 mb-4">
                This may take a few minutes. Please don't close this window.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={cancelGeneration}>
                Cancel Generation
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (Days)
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Content Types
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {contentTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    {type}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeContentType(type)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['blog-post', 'tutorial', 'case-study', 'news', 'guide'].map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addContentType(type)}
                    disabled={contentTypes.includes(type)}
                  >
                    + {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Writing Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Publishing Schedule</Label>
                <Select value={publishingSchedule} onValueChange={(value: any) => setPublishingSchedule(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Audience
              </Label>
              <Input
                id="audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Marketing professionals, Small business owners..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Keywords (Optional)
              </Label>
              <Textarea
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3..."
                rows={2}
              />
              <div className="text-xs text-gray-500">
                Separate keywords with commas. These will be distributed across generated articles.
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={contentTypes.length === 0}
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate {duration} Articles
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
