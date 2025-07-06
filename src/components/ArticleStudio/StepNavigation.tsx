
import React from 'react';
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

const STEPS = [
  { 
    id: 1, 
    title: 'Title', 
    icon: Lightbulb, 
    description: 'Generate title' 
  },
  { 
    id: 2, 
    title: 'Outline', 
    icon: FileText, 
    description: 'Create structure' 
  },
  { 
    id: 3, 
    title: 'Article', 
    icon: PenTool, 
    description: 'Generate content' 
  }
];

interface StepNavigationProps {
  currentStep: number;
  totalSteps?: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onComplete?: () => Promise<void>;
  isGenerating: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps = STEPS.length,
  onNext,
  onPrev,
  canProceed,
  onComplete,
  isGenerating
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <Progress value={progress} className="h-2" />

      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'border-purple-500 bg-purple-50 shadow-md scale-105' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isCurrent 
                      ? 'bg-purple-600 text-white' 
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
                  
                  <div className="text-center">
                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                    <Badge 
                      variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'} 
                      className="text-xs"
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : null}
                      {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 1 || isGenerating}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={onNext}
            disabled={!canProceed || isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            disabled={!canProceed || isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <PenTool className="w-4 h-4" />
            {isGenerating ? 'Creating...' : 'Create Article'}
          </Button>
        )}
      </div>
    </div>
  );
};
