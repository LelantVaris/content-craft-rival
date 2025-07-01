
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteCrawler } from '@/hooks/useWebsiteCrawler';
import { useCrawlStatus } from '@/hooks/useCrawlStatus';
import { useWebsiteMap } from '@/hooks/useWebsiteMap';
import { CrawlConsole } from '@/components/CrawlConsole';
import { CrawlProgress } from '@/components/CrawlProgress';
import { WebsiteMapGraph } from '@/components/WebsiteMapGraph';
import { Globe, Search, CheckCircle, Clock, AlertCircle, BarChart3, List } from 'lucide-react';

interface ConsoleMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

interface RealTimeProgress {
  totalPages: number;
  crawledPages: number;
  status: string;
}

const CrawlerTest = () => {
  const [url, setUrl] = useState('');
  const [currentCrawl, setCurrentCrawl] = useState<{
    websiteMapId: string;
    crawlJobId?: string;
    status: string;
    startTime?: Date;
  } | null>(null);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [userMaps, setUserMaps] = useState<any[]>([]);
  const [realTimeProgress, setRealTimeProgress] = useState<RealTimeProgress>({
    totalPages: 0,
    crawledPages: 0,
    status: 'idle'
  });

  const { startCrawl, isLoading: isCrawling } = useWebsiteCrawler();
  const { checkStatus, isLoading: isCheckingStatus } = useCrawlStatus();
  const { websiteMap, pages, loading: isLoadingMap, fetchUserMaps, fetchWebsiteMap } = useWebsiteMap(currentCrawl?.websiteMapId);

  // Auto-polling for active crawls
  useEffect(() => {
    if (!currentCrawl?.crawlJobId || !currentCrawl?.websiteMapId) return;
    if (currentCrawl.status === 'completed' || currentCrawl.status === 'failed') return;

    const interval = setInterval(async () => {
      console.log('Auto-checking crawl status...');
      const result = await checkStatus(currentCrawl.crawlJobId!, currentCrawl.websiteMapId);
      
      if (result?.success && result.status) {
        const oldStatus = currentCrawl.status;
        const newStatus = result.status;
        
        // Update real-time progress
        setRealTimeProgress({
          totalPages: result.total || 0,
          crawledPages: result.completed || 0,
          status: newStatus
        });
        
        setCurrentCrawl(prev => prev ? { ...prev, status: newStatus } : null);
        
        // Add console message for status changes
        if (oldStatus !== newStatus) {
          addConsoleMessage(
            `Status changed from ${oldStatus} to ${newStatus}`,
            newStatus === 'completed' ? 'success' : 
            newStatus === 'failed' ? 'error' : 'info'
          );
        }
        
        // Add progress update messages
        if (result.completed && result.total) {
          addConsoleMessage(
            `Progress: ${result.completed}/${result.total} pages crawled`,
            'info'
          );
        }
        
        // If completed, refresh the website map data
        if (newStatus === 'completed') {
          setTimeout(() => {
            fetchWebsiteMap(currentCrawl.websiteMapId);
          }, 2000); // Give backend time to process data
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [currentCrawl?.crawlJobId, currentCrawl?.websiteMapId, currentCrawl?.status, checkStatus, fetchWebsiteMap]);

  const addConsoleMessage = (message: string, type: ConsoleMessage['type'] = 'info') => {
    const newMessage: ConsoleMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    };
    
    setConsoleMessages(prev => [...prev, newMessage]);
  };

  const handleStartCrawl = async () => {
    if (!url.trim()) return;

    // Clear previous data
    setConsoleMessages([]);
    setRealTimeProgress({ totalPages: 0, crawledPages: 0, status: 'idle' });
    addConsoleMessage(`Starting crawl for ${url}`, 'info');

    const result = await startCrawl({
      websiteUrl: url,
      isLeadMagnet: false
    });

    if (result?.success && result.websiteMapId) {
      const startTime = new Date();
      setCurrentCrawl({
        websiteMapId: result.websiteMapId,
        crawlJobId: result.crawlJobId,
        status: result.status || 'crawling',
        startTime
      });
      
      // Set initial progress
      setRealTimeProgress({
        totalPages: result.totalPages || 0,
        crawledPages: 0,
        status: result.status || 'crawling'
      });
      
      addConsoleMessage(`Crawl started successfully`, 'success');
      addConsoleMessage(`Found ${result.totalPages} total pages to crawl`, 'info');
      addConsoleMessage(`Crawl job ID: ${result.crawlJobId}`, 'info');
    } else {
      addConsoleMessage(`Failed to start crawl`, 'error');
    }
  };

  const handleManualStatusCheck = async () => {
    if (!currentCrawl?.crawlJobId || !currentCrawl?.websiteMapId) return;

    addConsoleMessage('Manually checking crawl status...', 'info');
    
    const result = await checkStatus(currentCrawl.crawlJobId, currentCrawl.websiteMapId);
    
    if (result?.success) {
      setCurrentCrawl(prev => prev ? { ...prev, status: result.status || 'unknown' } : null);
      setRealTimeProgress({
        totalPages: result.total || 0,
        crawledPages: result.completed || 0,
        status: result.status || 'unknown'
      });
      addConsoleMessage(`Status check complete: ${result.status}`, 'success');
      
      if (result.completed && result.total) {
        addConsoleMessage(`Progress: ${result.completed}/${result.total} pages`, 'info');
      }
    } else {
      addConsoleMessage('Status check failed', 'error');
    }
  };

  const handleLoadUserMaps = async () => {
    addConsoleMessage('Loading user website maps...', 'info');
    const maps = await fetchUserMaps();
    setUserMaps(maps);
    addConsoleMessage(`Loaded ${maps.length} website maps`, 'success');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'crawling':
      case 'scraping':
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
      case 'scraping':
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
          <p className="text-gray-600">Test the website crawling functionality with real-time updates</p>
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

      {/* Progress and Console Side by Side */}
      {currentCrawl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Card */}
          <CrawlProgress
            totalPages={realTimeProgress.totalPages}
            crawledPages={realTimeProgress.crawledPages}
            status={realTimeProgress.status}
            startTime={currentCrawl.startTime}
            websiteUrl={url}
          />
          
          {/* Console */}
          <CrawlConsole messages={consoleMessages} />
        </div>
      )}

      {/* Manual Status Check */}
      {currentCrawl && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                onClick={handleManualStatusCheck} 
                disabled={isCheckingStatus}
                variant="outline"
              >
                {isCheckingStatus ? 'Checking...' : 'Check Status Now'}
              </Button>
              
              {websiteMap && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Map ID: {currentCrawl.websiteMapId.slice(0, 8)}...</span>
                  {currentCrawl.crawlJobId && (
                    <span>Job ID: {currentCrawl.crawlJobId.slice(0, 8)}...</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results View - Graph and Pages */}
      {currentCrawl && realTimeProgress.status === 'completed' && pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Crawl Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="graph" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Connection Map
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Pages List
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="graph" className="mt-6">
                <WebsiteMapGraph websiteMapId={currentCrawl.websiteMapId} />
              </TabsContent>
              
              <TabsContent value="pages" className="mt-6">
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
              </TabsContent>
            </Tabs>
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
