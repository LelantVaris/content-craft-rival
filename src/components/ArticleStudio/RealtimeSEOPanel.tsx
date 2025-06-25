
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface RealtimeSEOPanelProps {
  title: string;
  content: string;
  keywords: string[];
  targetAudience: string;
}

export const RealtimeSEOPanel: React.FC<RealtimeSEOPanelProps> = ({
  title,
  content,
  keywords,
  targetAudience
}) => {
  const seoAnalysis = useMemo(() => {
    const checks = [
      {
        name: 'Title Length',
        status: title && title.length >= 30 && title.length <= 60 ? 'good' : 
                title && title.length > 0 ? 'warning' : 'error',
        description: title ? `${title.length} characters` : 'No title set',
        recommendation: 'Optimal title length is 30-60 characters'
      },
      {
        name: 'Content Length',
        status: content.split(/\s+/).length > 300 ? 'good' : 
                content.split(/\s+/).length > 100 ? 'warning' : 'error',
        description: `${content.split(/\s+/).filter(w => w.length > 0).length} words`,
        recommendation: 'Aim for at least 300 words for better SEO'
      },
      {
        name: 'Keywords Present',
        status: keywords.length > 0 && keywords.some(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase()) ||
          title.toLowerCase().includes(keyword.toLowerCase())
        ) ? 'good' : keywords.length > 0 ? 'warning' : 'error',
        description: keywords.length > 0 ? `${keywords.length} keywords defined` : 'No keywords set',
        recommendation: 'Include your target keywords naturally in content'
      },
      {
        name: 'Target Audience',
        status: targetAudience && targetAudience.length > 10 ? 'good' : 
                targetAudience ? 'warning' : 'error',
        description: targetAudience ? 'Audience defined' : 'No target audience',
        recommendation: 'Define your target audience for better content focus'
      }
    ];

    const goodCount = checks.filter(check => check.status === 'good').length;
    const totalScore = Math.round((goodCount / checks.length) * 100);

    return { checks, totalScore };
  }, [title, content, keywords, targetAudience]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-green-600" />
          SEO Analysis
          <Badge variant="outline" className="ml-auto">
            {seoAnalysis.totalScore}/100
          </Badge>
        </CardTitle>
        <Progress value={seoAnalysis.totalScore} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {seoAnalysis.checks.map((check, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}>
            <div className="flex items-start gap-2">
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{check.name}</h4>
                </div>
                <p className="text-xs mt-1 opacity-75">{check.description}</p>
                <p className="text-xs mt-1 font-medium">{check.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
