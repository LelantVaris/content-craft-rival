
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
    // Clean content by removing markdown formatting for accurate analysis
    const cleanContent = content.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim();
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const titleLength = title ? title.length : 0;
    
    // Calculate keyword density - check both exact matches and partial matches
    let keywordDensity = 0;
    let totalKeywordMentions = 0;
    
    if (keywords.length > 0 && cleanContent) {
      const contentLower = cleanContent.toLowerCase();
      const titleLower = title.toLowerCase();
      
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Count in content
        const contentMatches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
        // Count in title (weighted more heavily)
        const titleMatches = (titleLower.match(new RegExp(keywordLower, 'g')) || []).length;
        
        totalKeywordMentions += contentMatches + (titleMatches * 2); // Title keywords count double
      });
      
      keywordDensity = wordCount > 0 ? (totalKeywordMentions / wordCount) * 100 : 0;
    }

    // Enhanced readability score calculation
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = words.reduce((sum, word) => {
      // Simple syllable estimation
      const syllables = word.toLowerCase().match(/[aeiouy]+/g)?.length || 1;
      return sum + syllables;
    }, 0) / (wordCount || 1);
    
    // Flesch Reading Ease approximation
    const fleschScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    // Title SEO analysis
    const titleHasKeywords = keywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );

    // Content structure analysis
    const headingMatches = content.match(/^#{1,6}\s+.+$/gm) || [];
    const headingCount = headingMatches.length;
    
    const checks = [
      {
        name: 'Title Length',
        status: titleLength >= 30 && titleLength <= 60 ? 'good' : 
                titleLength > 0 && titleLength >= 20 ? 'warning' : 'error',
        description: title ? `${titleLength} characters` : 'No title set',
        recommendation: 'Optimal title length is 30-60 characters',
        score: titleLength >= 30 && titleLength <= 60 ? 25 : 
               titleLength >= 20 ? 15 : 0
      },
      {
        name: 'Content Length',
        status: wordCount >= 800 ? 'good' : 
                wordCount >= 300 ? 'warning' : 'error',
        description: `${wordCount} words`,
        recommendation: 'Aim for at least 800 words for better SEO',
        score: wordCount >= 800 ? 25 : 
               wordCount >= 300 ? 15 : 
               wordCount >= 100 ? 8 : 0
      },
      {
        name: 'Keyword Optimization',
        status: keywordDensity >= 1 && keywordDensity <= 3 ? 'good' : 
                keywordDensity > 0 && keywordDensity <= 5 ? 'warning' : 'error',
        description: `${keywordDensity.toFixed(1)}% density (${totalKeywordMentions} mentions)`,
        recommendation: 'Target keyword density between 1-3%',
        score: keywordDensity >= 1 && keywordDensity <= 3 ? 25 : 
               keywordDensity > 0 ? 15 : 0
      },
      {
        name: 'Readability',
        status: fleschScore >= 60 ? 'good' : 
                fleschScore >= 40 ? 'warning' : 'error',
        description: `${Math.round(fleschScore)}/100 score`,
        recommendation: 'Keep sentences clear and concise for better readability',
        score: fleschScore >= 60 ? 25 : 
               fleschScore >= 40 ? 15 : 
               fleschScore >= 20 ? 8 : 0
      }
    ];

    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);

    return { 
      checks, 
      totalScore, 
      keywordDensity, 
      readabilityScore: fleschScore,
      titleHasKeywords,
      headingCount,
      totalKeywordMentions 
    };
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
        
        {/* Keyword insights */}
        {keywords.length > 0 && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Keyword Insights</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
              <div>Keywords: {keywords.length}</div>
              <div>Mentions: {seoAnalysis.totalKeywordMentions}</div>
              <div>In Title: {seoAnalysis.titleHasKeywords ? 'Yes' : 'No'}</div>
              <div>Headings: {seoAnalysis.headingCount}</div>
            </div>
          </div>
        )}
        
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
