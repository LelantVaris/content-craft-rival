
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileSetupStepProps {
  data: {
    fullName: string;
  };
  onUpdate: (data: Partial<any>) => void;
  onNext: () => void;
}

export const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  const [fullName, setFullName] = useState(data.fullName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim()) {
      onUpdate({ fullName });
      onNext();
    }
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Welcome to ArticleForge
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Let's get you set up with AI-powered content creation
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              What's your full name?
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="h-12 text-base"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={!fullName.trim()}
          >
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
