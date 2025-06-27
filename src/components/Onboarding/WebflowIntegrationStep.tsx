
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Globe, ArrowRight } from 'lucide-react';

interface WebflowIntegrationStepProps {
  data: any;
  onUpdate: (data: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const WebflowIntegrationStep: React.FC<WebflowIntegrationStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const handleConnectWebflow = () => {
    onUpdate({ webflowConnected: true });
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ webflowConnected: false });
    onNext();
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="text-center pb-6">
        <button
          onClick={onBack}
          className="absolute left-6 top-6 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Connect your Webflow site
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Publish articles directly to your Webflow blog with one click
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Benefits of connecting:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>One-click publishing to your blog</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Automatic SEO optimization</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Maintain your site's design and branding</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleConnectWebflow}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center space-x-2"
          >
            <span>Connect Webflow</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button 
            onClick={handleSkip}
            variant="ghost"
            className="w-full h-12 text-gray-600 hover:text-gray-800 font-medium"
          >
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You can always connect your Webflow site later in your dashboard
        </p>
      </CardContent>
    </Card>
  );
};
