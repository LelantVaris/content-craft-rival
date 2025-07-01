
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWebsiteCrawler } from '@/hooks/useWebsiteCrawler';
import { useCrawlStatus } from '@/hooks/useCrawlStatus';
import { useWebsiteMap } from '@/hooks/useWebsiteMap';
import { Globe, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const CrawlerTest = () => {
  const [url, setUrl] = useState('https://example.com');
  const { startCrawl, loading: crawlLoading, crawlData } = useWebsiteCrawler();
  const { status, loading: statusLoading, polling, startPolling, stopPolling } = useCrawlStatus(
    crawlData?.crawlJobId || null,
    crawlData?.websiteMapId || null
  );
  const { websiteMap, pages, connections, loading: mapLoading } = useWebsiteMap(
    crawlData?.websiteMapId || null
  );

  const handleStartCrawl = async () => {
    try {
      const result = await startCrawl(url, false);
      if (result.success && result.crawlJobId) {
        // Start polling for status updates
        setTimeout(() => startPolling(), 2000);
      }
    } catch (error) {
      console.error('Crawl failed:', error);
    }
  };

  const getStatusIcon = () => {
    if (!status) return <Clock className="w-4 h-4" />;
    
    switch (status.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'crawling':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'crawling':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Website Crawler Test</h1>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Start Website Crawl</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleStartCrawl}
              disabled={crawlLoading || !url}
            >
              {crawlLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                'Start Crawl'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Initial Crawl Results */}
      {crawlData && (
        <Card>
          <CardHeader>
            <CardTitle>Crawl Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Website Map ID:</span>
                <p className="font-mono text-sm">{crawlData.websiteMapId}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Crawl Job ID:</span>
                <p className="font-mono text-sm">{crawlData.crawlJobId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Pages Found:</span>
                <p className="font-semibold">{crawlData.totalPages}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-semibold">{crawlData.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Monitoring */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Crawl Status
              <Badge className={getStatusColor()}>
                {status.status || 'Unknown'}
              </Badge>
              {polling && (
                <Badge variant="outline" className="ml-auto">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Polling
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status.completed !== undefined && status.total !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span>{status.completed} / {status.total} pages</span>
                </div>
                <Progress 
                  value={status.total > 0 ? (status.completed / status.total) * 100 : 0} 
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={startPolling}
                disabled={polling}
              >
                Start Polling
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={stopPolling}
                disabled={!polling}
              >
                Stop Polling
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Website Map Data */}
      {websiteMap && (
        <Card>
          <CardHeader>
            <CardTitle>Website Map Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Website URL:</span>
                <p className="font-semibold">{websiteMap.website_url}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Crawl Status:</span>
                <Badge className={getStatusColor()}>
                  {websiteMap.crawl_status}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Pages:</span>
                <p className="font-semibold">{websiteMap.total_pages}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Crawled Pages:</span>
                <p className="font-semibold">{websiteMap.crawled_pages}</p>
              </div>
            </div>

            {websiteMap.last_crawl_date && (
              <div>
                <span className="text-sm text-gray-600">Last Crawl:</span>
                <p className="text-sm">{new Date(websiteMap.last_crawl_date).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pages and Connections Summary */}
      {(pages.length > 0 || connections.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pages Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pages.length}</p>
              {pages.slice(0, 5).map((page, index) => (
                <div key={page.id} className="text-sm text-gray-600 truncate">
                  {index + 1}. {page.title || page.url}
                </div>
              ))}
              {pages.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... and {pages.length - 5} more pages
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{connections.length}</p>
              <p className="text-sm text-gray-600">
                Connections between pages discovered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify({ crawlData, status, websiteMap }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrawlerTest;
