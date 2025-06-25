
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

interface StepNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onComplete: () => Promise<void>;
  isGenerating: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onNext,
  onPrev,
  canProceed,
  onComplete,
  isGenerating
}) => {
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {currentStep} of {STEPS.length}</span>
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
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'border-purple-500 bg-purple-50 shadow-md scale-105' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
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
                  
                  <div className="text-center">
                    <h4 className="font-medium text-xs mb-1">{step.title}</h4>
                    <Badge 
                      variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'} 
                      className="text-xs"
                    >
                      {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-all ${
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

        {currentStep < STEPS.length ? (
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
