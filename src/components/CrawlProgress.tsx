
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, Zap } from 'lucide-react';

interface CrawlProgressProps {
  totalPages: number;
  crawledPages: number;
  status: string;
  startTime?: Date;
  websiteUrl: string;
}

export const CrawlProgress: React.FC<CrawlProgressProps> = ({
  totalPages,
  crawledPages,
  status,
  startTime,
  websiteUrl
}) => {
  const percentage = totalPages > 0 ? Math.round((crawledPages / totalPages) * 100) : 0;
  const remainingPages = Math.max(0, totalPages - crawledPages);
  
  const getElapsedTime = () => {
    if (!startTime) return 'Unknown';
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getEstimatedTimeRemaining = () => {
    if (!startTime || crawledPages === 0 || status !== 'crawling') return 'Unknown';
    const elapsed = (Date.now() - startTime.getTime()) / 1000;
    const avgTimePerPage = elapsed / crawledPages;
    const remainingTime = Math.ceil(avgTimePerPage * remainingPages);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `~${minutes}m ${seconds}s`;
  };

  const getCrawlSpeed = () => {
    if (!startTime || crawledPages === 0) return 'Unknown';
    const elapsed = (Date.now() - startTime.getTime()) / 1000 / 60; // minutes
    const pagesPerMinute = Math.round(crawledPages / elapsed);
    return `${pagesPerMinute} pages/min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'crawling':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Crawl Progress
          </div>
          <Badge className={getStatusColor(status)}>
            {status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-gray-600 truncate">
          {websiteUrl}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">
              {crawledPages} / {totalPages} pages ({percentage}%)
            </span>
          </div>
          <Progress value={percentage} className="w-full h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Elapsed</span>
            </div>
            <div className="font-semibold">{getElapsedTime()}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Remaining</span>
            </div>
            <div className="font-semibold">{getEstimatedTimeRemaining()}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Speed</span>
            </div>
            <div className="font-semibold">{getCrawlSpeed()}</div>
          </div>
        </div>

        {remainingPages > 0 && status === 'crawling' && (
          <div className="text-sm text-center text-gray-600">
            {remainingPages} pages remaining
          </div>
        )}
      </CardContent>
    </Card>
  );
};
