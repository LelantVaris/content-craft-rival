
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TitleSummaryProps {
  selectedTitle: string;
}

export const TitleSummary: React.FC<TitleSummaryProps> = ({ selectedTitle }) => {
  if (!selectedTitle) return null;

  return (
    <Card className="border-2 border-green-100 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-green-600">Selected Title</Badge>
        </div>
        <p className="text-green-900 font-medium leading-relaxed">
          {selectedTitle}
        </p>
      </CardContent>
    </Card>
  );
};
