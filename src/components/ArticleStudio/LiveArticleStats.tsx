
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Target, TrendingUp, FileText, CheckCircle } from 'lucide-react';

interface LiveArticleStatsProps {
  title: string;
  content: string;
  keywords: string[];
  isGenerating: boolean;
}

export const LiveArticleStats: React.FC<LiveArticleStatsProps> = ({
  title,
  content,
  keywords,
  isGenerating
}) => {
  const stats = useMemo(() => {
    const wordCount = content ? content.split(/\s+/).filter(word => word.length > 0).length : 0;
    const characterCount = content.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
    
    // Count headings for structure analysis
    const headingMatches = content.match(/^#{1,6}\s+.+$/gm) || [];
    const headingCount = headingMatches.length;
    
    // Count paragraphs
    const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
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
    
    // Simple SEO score calculation (enhanced)
    let seoScore = 0;
    if (title) seoScore += 15;
    if (title && title.length >= 30 && title.length <= 60) seoScore += 10;
    if (wordCount > 300) seoScore += 20;
    if (wordCount > 1000) seoScore += 15;
    if (keywords.length > 0) seoScore += 10;
    if (keywordDensity >= 1 && keywordDensity <= 3) seoScore += 15;
    if (headingCount >= 2) seoScore += 10;
    if (paragraphCount >= 3) seoScore += 5;
    
    // Publish readiness score
    let publishReadiness = 0;
    if (title && title.length > 10) publishReadiness += 20;
    if (wordCount >= 300) publishReadiness += 30;
    if (headingCount >= 2) publishReadiness += 20;
    if (keywordDensity > 0) publishReadiness += 15;
    if (paragraphCount >= 3) publishReadiness += 15;
    
    return {
      wordCount,
      characterCount,
      readingTime,
      headingCount,
      paragraphCount,
      keywordDensity,
      seoScore: Math.min(100, seoScore),
      publishReadiness: Math.min(100, publishReadiness)
    };
  }, [title, content, keywords]);

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSEOScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getPublishReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {/* Word Count */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Words</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.wordCount.toLocaleString()}
                {isGenerating && <span className="text-blue-600 animate-pulse">...</span>}
              </p>
            </div>
          </div>

          {/* Reading Time */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Read Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.readingTime} min
              </p>
            </div>
          </div>

          {/* SEO Score */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">SEO Score</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900">{stats.seoScore}/100</p>
                <Badge variant="outline" className={`text-xs ${getSEOScoreColor(stats.seoScore)} text-white border-0`}>
                  {getSEOScoreText(stats.seoScore)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Keywords</p>
              <p className="text-lg font-semibold text-gray-900">
                {keywords.length}
                {stats.keywordDensity > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({stats.keywordDensity.toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Structure */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Structure</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.headingCount}H/{stats.paragraphCount}P
              </p>
            </div>
          </div>

          {/* Publish Readiness */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Readiness</p>
              <p className={`text-lg font-semibold ${getPublishReadinessColor(stats.publishReadiness)}`}>
                {stats.publishReadiness}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
