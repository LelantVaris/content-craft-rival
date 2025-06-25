
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Target } from 'lucide-react';

interface ArticleStatsProps {
  title: string;
  content: string;
  keywords: string[];
}

export const ArticleStats: React.FC<ArticleStatsProps> = ({
  title,
  content,
  keywords
}) => {
  const wordCount = content ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  const characterCount = content.length;
  
  // Simple SEO score calculation
  const calculateSEOScore = () => {
    let score = 0;
    if (title && title.length >= 30 && title.length <= 60) score += 25;
    if (wordCount >= 300) score += 25;
    if (keywords.length > 0) score += 25;
    if (content.includes(title.toLowerCase())) score += 25;
    return score;
  };

  const seoScore = calculateSEOScore();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Content Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Words:</span>
            <Badge variant="outline">{wordCount}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Characters:</span>
            <Badge variant="outline">{characterCount}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-blue-600" />
            SEO & Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>SEO Score:</span>
            <Badge 
              variant={seoScore >= 75 ? "default" : seoScore >= 50 ? "secondary" : "destructive"}
            >
              {seoScore}/100
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Reading Time:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readingTime} min
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
