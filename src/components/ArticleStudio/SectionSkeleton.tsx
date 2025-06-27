
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Brain, Loader2 } from 'lucide-react';

interface SectionSkeletonProps {
  title: string;
  phase: 'researching' | 'enhancing' | 'writing';
  progress?: number;
  sources?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title,
  phase,
  progress = 0,
  sources = 0
}) => {
  const getPhaseIcon = () => {
    switch (phase) {
      case 'researching': return <Search className="w-5 h-5 text-amber-600 animate-pulse" />;
      case 'enhancing': return <Brain className="w-5 h-5 text-purple-600 animate-pulse" />;
      case 'writing': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Search className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'researching': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'enhancing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'writing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'researching': return `Researching${sources > 0 ? ` (${sources} sources)` : '...'}`;
      case 'enhancing': return 'Enhancing with insights...';
      case 'writing': return 'Writing enhanced content...';
      default: return 'Processing...';
    }
  };

  return (
    <div className={`my-6 p-4 border-2 border-dashed rounded-lg animate-pulse transition-all duration-300 ${getPhaseColor().replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-')}`}>
      <div className="flex items-center gap-2 mb-4">
        {getPhaseIcon()}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Badge variant="secondary" className={`ml-auto ${getPhaseColor()}`}>
          {getPhaseLabel()}
        </Badge>
      </div>
      
      {progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                phase === 'researching' ? 'bg-amber-500' :
                phase === 'enhancing' ? 'bg-purple-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        
        {phase === 'researching' && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <Search className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">
                Gathering latest insights from the web...
              </span>
            </div>
          </div>
        )}
        
        {phase === 'enhancing' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
      </div>
    </div>
  );
};
