
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  FileText, 
  PenTool,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import TitleGenerationStep from './TitleGenerationStep';
import OutlineCreationStep from './OutlineCreationStep';
import ContentGenerationStep from './ContentGenerationStep';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { 
    id: 1, 
    title: 'Generate Title', 
    icon: Lightbulb, 
    description: 'AI-powered title suggestions' 
  },
  { 
    id: 2, 
    title: 'Create Outline', 
    icon: FileText, 
    description: 'Structure your content' 
  },
  { 
    id: 3, 
    title: 'Generate Content', 
    icon: PenTool, 
    description: 'AI writes your article' 
  }
];

export interface ArticleData {
  topic: string;
  keywords: string[];
  audience: string;
  selectedTitle: string;
  customTitle?: string;
  outline: OutlineSection[];
  generatedContent: string;
  seoNotes: string;
}

export interface OutlineSection {
  id: string;
  title: string;
  content: string;
  characterCount: number;
  expanded: boolean;
}

const EnhancedArticleWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [articleData, setArticleData] = useState<ArticleData>({
    topic: '',
    keywords: [],
    audience: '',
    selectedTitle: '',
    customTitle: '',
    outline: [],
    generatedContent: '',
    seoNotes: ''
  });
  const navigate = useNavigate();

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    navigate('/article/editor', { 
      state: { 
        title: finalTitle,
        content: articleData.generatedContent || `# ${finalTitle}\n\nStart writing your article here...`,
        outline: articleData.outline
      }
    });
  };

  const updateArticleData = (updates: Partial<ArticleData>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return articleData.selectedTitle || articleData.customTitle;
      case 2:
        return articleData.outline.length > 0;
      case 3:
        return articleData.generatedContent.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TitleGenerationStep
            articleData={articleData}
            onUpdate={updateArticleData}
          />
        );
      case 2:
        return (
          <OutlineCreationStep
            articleData={articleData}
            onUpdate={updateArticleData}
          />
        );
      case 3:
        return (
          <ContentGenerationStep
            articleData={articleData}
            onUpdate={updateArticleData}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <PenTool className="w-7 h-7 text-purple-600" />
            AI Article Creator
          </CardTitle>
          <CardDescription className="text-base">
            Create engaging, SEO-optimized content with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isUpcoming = step.id > currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div 
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                        isCurrent 
                          ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                          : isCompleted 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCurrent 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : isCompleted 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-gray-600">{step.description}</p>
                        <Badge 
                          variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'} 
                          className="text-xs mt-2"
                        >
                          {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    {/* Connector Line */}
                    {index < STEPS.length - 1 && (
                      <div className={`w-16 h-1 mx-2 transition-all ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <PenTool className="w-4 h-4" />
                Open in Editor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedArticleWizard;
