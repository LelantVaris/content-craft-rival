
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Target, TrendingUp } from 'lucide-react';

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
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
    const characterCount = content.length;
    
    // Simple SEO score calculation
    let seoScore = 0;
    if (title) seoScore += 20;
    if (wordCount > 300) seoScore += 20;
    if (wordCount > 1000) seoScore += 20;
    if (keywords.length > 0) seoScore += 20;
    if (content && keywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    )) seoScore += 20;
    
    return {
      wordCount,
      readingTime,
      characterCount,
      seoScore: Math.min(100, seoScore)
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

  return (
    <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
