
import React from 'react';
import { Card } from '@/components/ui/card';

export const AnimatedLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generating your titles...
        </h3>
        <p className="text-gray-600">
          AI is creating compelling article titles for you
        </p>
      </div>

      {/* Animated skeleton cards */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      ))}

      {/* Pulsing dots animation */}
      <div className="flex justify-center space-x-2 pt-4">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};
