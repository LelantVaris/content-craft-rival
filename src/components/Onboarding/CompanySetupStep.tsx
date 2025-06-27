
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface CompanySetupStepProps {
  data: {
    companyName: string;
    websiteUrl: string;
    industry: string;
  };
  onUpdate: (data: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Other'
];

export const CompanySetupStep: React.FC<CompanySetupStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [companyName, setCompanyName] = useState(data.companyName || '');
  const [websiteUrl, setWebsiteUrl] = useState(data.websiteUrl || '');
  const [industry, setIndustry] = useState(data.industry || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      onUpdate({ companyName, websiteUrl, industry });
      onNext();
    }
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
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Tell us about your company
        </CardTitle>
        <p className="text-gray-600 mt-2">
          This helps us create more targeted content for your audience
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
              Company name *
            </Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourcompany.com"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind.toLowerCase()}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={!companyName.trim()}
          >
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
