
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  FileText, 
  PenTool, 
  Sparkles, 
  Globe, 
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Keyword Research', icon: Search, description: 'Pull SERP data and cluster intents' },
  { id: 2, title: 'Outline', icon: FileText, description: 'Generate H2/H3 structure and metadata' },
  { id: 3, title: 'Draft', icon: PenTool, description: 'Create ~1200 words of content' },
  { id: 4, title: 'SEO Polish', icon: Sparkles, description: 'Add entities, FAQ, and internal links' },
  { id: 5, title: 'Meta Info', icon: Globe, description: 'Generate title, description, and schema markup' },
  { id: 6, title: 'Publish', icon: Send, description: 'Push to CMS via webhook' }
];

const BlogWriterWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [workflowData, setWorkflowData] = useState({
    keywordData: null,
    outlineData: null,
    draftContent: '',
    seoPolish: null,
    metaInfo: null,
    publishConfig: null
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleStartWorkflow = () => {
    if (topic.trim()) {
      setCurrentStep(2);
      // TODO: Implement keyword research API call
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Enter your topic or main keyword</Label>
              <Input
                id="topic"
                placeholder="e.g., Best project management tools for small teams"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleStartWorkflow}
              disabled={!topic.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Start Blog Writer Workflow
            </Button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Researching keywords and analyzing SERP data...</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Topic: {topic}</h4>
              <p className="text-sm text-gray-600">
                Analyzing search intent, finding related keywords, and studying top-ranking content.
              </p>
            </div>
            <Button 
              onClick={() => setCurrentStep(3)}
              className="w-full"
            >
              Continue to Outline Generation
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Step {currentStep} content coming soon...</p>
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep >= 6}
              className="mt-4"
            >
              {currentStep >= 6 ? 'Complete' : 'Continue'}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Blog Writer Workflow
          </CardTitle>
          <CardDescription>
            6-step AI-powered content creation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={`text-center p-3 rounded-lg border ${
                    isCurrent 
                      ? 'border-purple-500 bg-purple-50' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    isCurrent 
                      ? 'bg-purple-600 text-white' 
                      : isCompleted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <h4 className="font-medium text-xs mb-1">{step.title}</h4>
                  <Badge variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'} className="text-xs">
                    {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {STEPS[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription>
                {STEPS[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogWriterWizard;
