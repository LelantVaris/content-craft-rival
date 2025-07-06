
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  FileText, 
  PenTool, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { TitleGenerationPanel } from './TitleGenerationPanel';
import { OutlineCreationPanel } from './OutlineCreationPanel';
import { ContentGenerationPanel } from './ContentGenerationPanel';
import { StepNavigation } from './StepNavigation';
import { ArticleStudioData, GenerationStep } from '@/hooks/useArticleStudio';

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

interface UnifiedControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: () => boolean;
  saveAndComplete: () => Promise<void>;
  generateFullArticle: () => Promise<void>;
  autoSave: () => Promise<void>;
  generationStep: GenerationStep;
  streamingContent: string;
  streamingStatus: string;
  error: string;
  setStreamingContent: (content: string) => void;
  setGenerationStep: (step: GenerationStep) => void;
  setStreamingStatus: (status: string) => void;
  setError: (error: string) => void;
  getPrimaryKeyword: () => string;
  getSecondaryKeywords: () => string[];
  getTargetWordCount: () => number;
  isFormValid: () => boolean;
  generatedTitles: string[];
  setGeneratedTitles: (titles: string[]) => void;
  enhancedGeneration: any; // Centralized AI SDK state
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  nextStep,
  prevStep,
  canProceed,
  saveAndComplete,
  generateFullArticle,
  autoSave,
  generationStep,
  streamingContent,
  streamingStatus,
  error,
  setStreamingContent,
  setGenerationStep,
  setStreamingStatus,
  setError,
  getPrimaryKeyword,
  getSecondaryKeywords,
  getTargetWordCount,
  isFormValid,
  generatedTitles,
  setGeneratedTitles,
  enhancedGeneration // Use centralized AI SDK state
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Auto-expand current step
  useEffect(() => {
    setExpandedStep(articleData.currentStep);
  }, [articleData.currentStep]);

  const progress = (articleData.currentStep / STEPS.length) * 100;

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 1:
        return (
          <TitleGenerationPanel
            articleData={articleData}
            onUpdate={updateArticleData}
            generatedTitles={generatedTitles}
            setGeneratedTitles={setGeneratedTitles}
            isFormValid={isFormValid}
          />
        );
      case 2:
        return (
          <OutlineCreationPanel
            articleData={articleData}
            onUpdate={updateArticleData}
            getPrimaryKeyword={getPrimaryKeyword}
            getSecondaryKeywords={getSecondaryKeywords}
            getTargetWordCount={getTargetWordCount}
          />
        );
      case 3:
        return (
          <ContentGenerationPanel
            articleData={articleData}
            onUpdate={updateArticleData}
            onComplete={saveAndComplete}
            setStreamingContent={setStreamingContent}
            setIsGenerating={(generating) => setGenerationStep(generating ? GenerationStep.GENERATING_ARTICLE : GenerationStep.IDLE)}
            setStreamingStatus={setStreamingStatus}
            getPrimaryKeyword={getPrimaryKeyword}
            getSecondaryKeywords={getSecondaryKeywords}
            getTargetWordCount={getTargetWordCount}
            enhancedGeneration={enhancedGeneration} // Pass centralized AI SDK state
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Studio</h1>
          <p className="text-gray-600">Create engaging, SEO-optimized content with AI assistance</p>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {articleData.currentStep} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < articleData.currentStep;
            const isCurrent = step.id === articleData.currentStep;
            const isExpanded = expandedStep === step.id;
            
            return (
              <Card 
                key={step.id} 
                className={`transition-all duration-300 ${
                  isCurrent 
                    ? 'border-purple-300 shadow-lg bg-purple-50/50' 
                    : isCompleted 
                    ? 'border-green-300 bg-green-50/50' 
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : isCompleted 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'}
                    >
                      {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {renderStepContent(step.id)}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t bg-white p-4">
        <StepNavigation
          currentStep={articleData.currentStep}
          totalSteps={STEPS.length}
          canProceed={canProceed()}
          onNext={nextStep}
          onPrev={prevStep}
          isGenerating={generationStep !== GenerationStep.IDLE || enhancedGeneration?.isGenerating}
        />
      </div>
    </div>
  );
};
