
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal } from 'lucide-react';

interface ConsoleMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

interface CrawlConsoleProps {
  messages: ConsoleMessage[];
}

export const CrawlConsole: React.FC<CrawlConsoleProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getTypeBadge = (type: ConsoleMessage['type']) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };

    return colors[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Crawl Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm"
        >
          {messages.length === 0 ? (
            <div className="text-gray-400">Waiting for crawl activity...</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-2 flex items-start gap-2">
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                <Badge className={`${getTypeBadge(msg.type)} text-xs`}>
                  {msg.type.toUpperCase()}
                </Badge>
                <span className={getMessageColor(msg.type)}>
                  {msg.message}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
