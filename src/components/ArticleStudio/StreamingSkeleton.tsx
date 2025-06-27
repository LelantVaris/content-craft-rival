
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface StreamingSkeletonProps {
  phase: 'draft' | 'research' | 'enhancing' | 'writing' | 'complete';
  currentSection?: string;
  progress?: number;
  message?: string;
}

export const StreamingSkeleton: React.FC<StreamingSkeletonProps> = ({
  phase,
  currentSection,
  progress = 0,
  message
}) => {
  const getPhaseEmoji = () => {
    switch (phase) {
      case 'draft': return '🎯';
      case 'research': return '🔍';
      case 'enhancing': return '✨';
      case 'writing': return '✍️';
      case 'complete': return '🎉';
      default: return '⚡';
    }
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'draft': return 'Generating initial article structure...';
      case 'research': return 'Researching current information...';
      case 'enhancing': return 'Enhancing content with research insights...';
      case 'writing': return 'Writing optimized content...';
      case 'complete': return 'Generation complete!';
      default: return 'Processing...';
    }
  };

  return (
    <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl animate-pulse">{getPhaseEmoji()}</div>
          <div className="flex-1">
            <div className="font-medium text-gray-800">
              {message || getPhaseDescription()}
            </div>
            {currentSection && (
              <div className="text-sm text-gray-600 mt-1">
                Working on: {currentSection}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skeleton content */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {phase === 'research' && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <span className="animate-spin">🔍</span>
              <span className="text-sm font-medium">
                Gathering latest insights from the web...
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
