
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Loader2, 
  Search, 
  PenTool, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { SectionState } from '@/hooks/useEnhancedContentGeneration';
import { Markdown } from '@/components/prompt-kit/markdown';

interface SectionStreamingPreviewProps {
  title: string;
  sections: SectionState[];
  overallProgress: number;
  currentMessage: string;
  isGenerating: boolean;
  error?: string | null;
}

export const SectionStreamingPreview: React.FC<SectionStreamingPreviewProps> = ({
  title,
  sections,
  overallProgress,
  currentMessage,
  isGenerating,
  error
}) => {
  const getStatusIcon = (status: SectionState['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'researching':
        return <Search className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'writing':
        return <PenTool className="w-4 h-4 text-orange-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SectionState['status']) => {
    const variants = {
      pending: 'outline',
      researching: 'secondary',
      writing: 'secondary',
      complete: 'default',
      error: 'destructive'
    } as const;

    const labels = {
      pending: 'Pending',
      researching: 'Researching',
      writing: 'Writing',
      complete: 'Complete',
      error: 'Error'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with overall progress */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              {title}
            </CardTitle>
            {isGenerating && (
              <Badge variant="secondary" className="bg-blue-500 text-white animate-pulse">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Generating...
              </Badge>
            )}
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{currentMessage}</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card 
            key={section.id} 
            className={`transition-all duration-300 ${
              section.status === 'writing' || section.status === 'researching'
                ? 'border-2 border-blue-400 shadow-lg bg-blue-50/20' 
                : section.status === 'complete'
                ? 'border-green-200 bg-green-50/20'
                : 'border-gray-200'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(section.status)}
                  <CardTitle className="text-lg">
                    {index + 1}. {section.title}
                  </CardTitle>
                </div>
                {getStatusBadge(section.status)}
              </div>
              
              {section.message && section.status === 'researching' && (
                <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                  🔍 {section.message}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {section.status === 'pending' && (
                <div className="text-gray-500 text-sm italic">
                  Waiting to be generated...
                </div>
              )}
              
              {(section.status === 'researching' || section.status === 'writing') && !section.content && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              )}
              
              {section.content && (
                <div className="prose prose-sm max-w-none">
                  <Markdown>{section.content}</Markdown>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
