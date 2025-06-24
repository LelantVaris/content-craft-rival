
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { Coins, Crown, Zap } from 'lucide-react';

const CreditBalance = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </CardContent>
      </Card>
    );
  }

  const getPlanIcon = () => {
    switch (profile?.plan_type) {
      case 'pro':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'lifetime':
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <Coins className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPlanColor = () => {
    switch (profile?.plan_type) {
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'lifetime':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Credits</span>
          </div>
          <Badge className={getPlanColor()}>
            <div className="flex items-center gap-1">
              {getPlanIcon()}
              {profile?.plan_type?.toUpperCase() || 'FREE'}
            </div>
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">
            {profile?.credits || 0}
          </span>
          <Button variant="outline" size="sm">
            Buy Credits
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          For stand-alone tools only
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditBalance;
