
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PenTool, Loader2 } from 'lucide-react';

interface SectionSkeletonProps {
  title: string;
  isActive?: boolean;
  isComplete?: boolean;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title,
  isActive = false,
  isComplete = false
}) => {
  const getStatusColor = () => {
    if (isComplete) return 'bg-green-100 text-green-800 border-green-200';
    if (isActive) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = () => {
    if (isComplete) return <PenTool className="w-4 h-4 text-green-600" />;
    if (isActive) return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    return <PenTool className="w-4 h-4 text-gray-600" />;
  };

  const getStatusLabel = () => {
    if (isComplete) return 'Complete';
    if (isActive) return 'Writing...';
    return 'Pending';
  };

  return (
    <div className={`my-4 p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${getStatusColor().replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-')}`}>
      <div className="flex items-center gap-2 mb-3">
        {getStatusIcon()}
        <h3 className="text-lg font-medium text-gray-800 flex-1">{title}</h3>
        <Badge variant="secondary" className={getStatusColor()}>
          {getStatusLabel()}
        </Badge>
      </div>
      
      {!isComplete && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      )}
    </div>
  );
};
