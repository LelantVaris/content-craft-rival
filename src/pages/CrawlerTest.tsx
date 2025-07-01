
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWebsiteCrawler } from '@/hooks/useWebsiteCrawler';
import { useCrawlStatus } from '@/hooks/useCrawlStatus';
import { useWebsiteMap } from '@/hooks/useWebsiteMap';
import { Globe, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const CrawlerTest = () => {
  const [url, setUrl] = useState('');
  const [currentCrawl, setCurrentCrawl] = useState<{
    websiteMapId: string;
    crawlJobId?: string;
    status: string;
  } | null>(null);

  const { startCrawl, isLoading: isCrawling } = useWebsiteCrawler();
  const { checkStatus, isLoading: isCheckingStatus } = useCrawlStatus();
  const { websiteMap, pages, loading: isLoadingMap, fetchUserMaps } = useWebsiteMap(currentCrawl?.websiteMapId);
  const [userMaps, setUserMaps] = useState<any[]>([]);

  const handleStartCrawl = async () => {
    if (!url.trim()) return;

    const result = await startCrawl({
      websiteUrl: url,
      isLeadMagnet: false
    });

    if (result?.success && result.websiteMapId) {
      setCurrentCrawl({
        websiteMapId: result.websiteMapId,
        crawlJobId: result.crawlJobId,
        status: result.status || 'crawling'
      });
    }
  };

  const handleCheckStatus = async () => {
    if (!currentCrawl?.crawlJobId || !currentCrawl?.websiteMapId) return;

    const result = await checkStatus(currentCrawl.crawlJobId, currentCrawl.websiteMapId);
    
    if (result?.success) {
      setCurrentCrawl(prev => prev ? { ...prev, status: result.status || 'unknown' } : null);
    }
  };

  const handleLoadUserMaps = async () => {
    const maps = await fetchUserMaps();
    setUserMaps(maps);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'crawling':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-600" />;
    }
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Website Crawler Test</h1>
          <p className="text-gray-600">Test the website crawling functionality</p>
        </div>
      </div>

      {/* Crawl Form */}
      <Card>
        <CardHeader>
          <CardTitle>Start New Crawl</CardTitle>
          <CardDescription>
            Enter a website URL to start crawling and analyzing its structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleStartCrawl} 
              disabled={isCrawling || !url.trim()}
            >
              {isCrawling ? 'Starting...' : 'Start Crawl'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Crawl Status */}
      {currentCrawl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Crawl Status
              <Badge className={getStatusColor(currentCrawl.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(currentCrawl.status)}
                  {currentCrawl.status}
                </div>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Website Map ID:</span>
                <p className="font-mono text-xs">{currentCrawl.websiteMapId}</p>
              </div>
              {currentCrawl.crawlJobId && (
                <div>
                  <span className="font-medium">Crawl Job ID:</span>
                  <p className="font-mono text-xs">{currentCrawl.crawlJobId}</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleCheckStatus} 
              disabled={isCheckingStatus}
              variant="outline"
            >
              {isCheckingStatus ? 'Checking...' : 'Check Status'}
            </Button>

            {websiteMap && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Crawl Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Website: {websiteMap.website_url}</div>
                  <div>Total Pages: {websiteMap.total_pages}</div>
                  <div>Crawled Pages: {websiteMap.crawled_pages}</div>
                  <div>Status: {websiteMap.crawl_status}</div>
                </div>
                
                {websiteMap.crawled_pages && websiteMap.total_pages && (
                  <div className="mt-3">
                    <Progress 
                      value={(websiteMap.crawled_pages / websiteMap.total_pages) * 100} 
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {pages.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Discovered Pages ({pages.length})</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {pages.map((page) => (
                    <div key={page.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium truncate">{page.title || 'Untitled'}</div>
                      <div className="text-gray-600 text-xs truncate">{page.url}</div>
                      <div className="text-gray-500 text-xs">
                        {page.word_count} words • {page.internal_links?.length || 0} internal links
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Maps */}
      <Card>
        <CardHeader>
          <CardTitle>Your Website Maps</CardTitle>
          <CardDescription>
            View all your previously crawled websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleLoadUserMaps} variant="outline">
              Load My Maps
            </Button>
            
            {userMaps.length > 0 && (
              <div className="space-y-2">
                {userMaps.map((map) => (
                  <div key={map.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{map.website_url}</div>
                        <div className="text-sm text-gray-600">
                          {map.total_pages} pages • {map.crawled_pages} crawled
                        </div>
                      </div>
                      <Badge className={getStatusColor(map.crawl_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(map.crawl_status)}
                          {map.crawl_status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrawlerTest;
