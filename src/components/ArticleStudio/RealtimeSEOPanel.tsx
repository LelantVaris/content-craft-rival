
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertCircle, CheckCircle, Eye, Search } from 'lucide-react';

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
    const wordCount = content ? content.split(/\s+/).filter(w => w.length > 0).length : 0;
    const titleLength = title ? title.length : 0;
    
    // Calculate keyword density
    let keywordDensity = 0;
    if (keywords.length > 0 && content) {
      const totalKeywordMentions = keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword.toLowerCase(), 'gi');
        const matches = content.toLowerCase().match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      keywordDensity = wordCount > 0 ? (totalKeywordMentions / wordCount) * 100 : 0;
    }

    // Readability score (simplified)
    const avgWordsPerSentence = content ? content.split(/[.!?]+/).filter(s => s.trim()).length : 1;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));

    const checks = [
      {
        name: 'Title Length',
        status: titleLength >= 30 && titleLength <= 60 ? 'good' : 
                titleLength > 0 ? 'warning' : 'error',
        description: title ? `${titleLength} characters` : 'No title set',
        recommendation: 'Optimal title length is 30-60 characters',
        score: titleLength >= 30 && titleLength <= 60 ? 25 : titleLength > 0 ? 15 : 0
      },
      {
        name: 'Content Length',
        status: wordCount > 300 ? 'good' : 
                wordCount > 100 ? 'warning' : 'error',
        description: `${wordCount} words`,
        recommendation: 'Aim for at least 300 words for better SEO',
        score: wordCount > 300 ? 25 : wordCount > 100 ? 15 : 0
      },
      {
        name: 'Keyword Optimization',
        status: keywordDensity >= 1 && keywordDensity <= 3 ? 'good' : 
                keywordDensity > 0 ? 'warning' : 'error',
        description: `${keywordDensity.toFixed(1)}% density`,
        recommendation: 'Target keyword density between 1-3%',
        score: keywordDensity >= 1 && keywordDensity <= 3 ? 25 : keywordDensity > 0 ? 15 : 0
      },
      {
        name: 'Readability',
        status: readabilityScore >= 70 ? 'good' : 
                readabilityScore >= 50 ? 'warning' : 'error',
        description: `${Math.round(readabilityScore)}/100 score`,
        recommendation: 'Keep sentences clear and concise',
        score: readabilityScore >= 70 ? 25 : readabilityScore >= 50 ? 15 : 0
      }
    ];

    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);

    return { checks, totalScore, keywordDensity, readabilityScore };
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Search className="w-4 h-4 text-blue-600" />
          SEO Analysis
          <Badge variant="outline" className={`ml-auto ${getScoreColor(seoAnalysis.totalScore)}`}>
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
                  <Badge variant="outline" className="text-xs">
                    {check.score}/25
                  </Badge>
                </div>
                <p className="text-xs mt-1 opacity-75">{check.description}</p>
                <p className="text-xs mt-1 font-medium">{check.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
        
        {targetAudience && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Target Audience</span>
            </div>
            <p className="text-xs text-blue-700">{targetAudience}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
