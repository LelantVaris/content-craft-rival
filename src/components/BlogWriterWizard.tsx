
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PenTool, 
  Lightbulb, 
  Target, 
  Send,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Topic & Keywords', icon: Lightbulb, description: 'What do you want to write about?' },
  { id: 2, title: 'AI Draft', icon: PenTool, description: 'Let AI create your first draft' },
  { id: 3, title: 'SEO Optimize', icon: Target, description: 'Enhance for search engines' },
  { id: 4, title: 'Publish', icon: Send, description: 'Review and publish your article' }
];

const BlogWriterWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    audience: '',
    outline: '',
    draftContent: '',
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

  const handleStartWriting = () => {
    // Navigate to the article editor with the generated content
    navigate('/article/editor', { 
      state: { 
        title: formData.topic,
        content: formData.draftContent || `# ${formData.topic}\n\nStart writing your article here...`
      }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="topic" className="text-base font-medium">What's your article topic?</Label>
              <Input
                id="topic"
                placeholder="e.g., Best productivity tips for remote workers"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="mt-2 text-base"
              />
            </div>
            
            <div>
              <Label htmlFor="keywords" className="text-base font-medium">Target keywords (optional)</Label>
              <Input
                id="keywords"
                placeholder="e.g., remote work, productivity, work from home"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
            </div>

            <div>
              <Label htmlFor="audience" className="text-base font-medium">Who's your target audience?</Label>
              <Textarea
                id="audience"
                placeholder="e.g., Remote workers, freelancers, and digital nomads looking to improve their productivity"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleNext}
              disabled={!formData.topic.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg py-6"
            >
              Continue to AI Draft
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border">
              <h4 className="font-semibold text-lg mb-3">Article Topic: {formData.topic}</h4>
              {formData.keywords && (
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Keywords:</strong> {formData.keywords}
                </p>
              )}
              {formData.audience && (
                <p className="text-sm text-gray-600">
                  <strong>Audience:</strong> {formData.audience}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Ready to generate your AI-powered draft...</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">What happens next:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI will create a structured outline</li>
                  <li>• Generate engaging introduction and conclusion</li>
                  <li>• Add relevant subheadings and content</li>
                  <li>• Optimize for readability and engagement</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                Generate AI Draft
                <PenTool className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Draft Generated Successfully!</span>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border">
              <h4 className="font-semibold mb-3">SEO Optimization Suggestions</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Title optimization</p>
                    <p className="text-xs text-gray-600">Your title includes target keywords</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Content structure</p>
                    <p className="text-xs text-gray-600">Well-organized with proper headings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Meta description needed</p>
                    <p className="text-xs text-gray-600">Add a compelling meta description</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Additional SEO Notes (optional)</Label>
              <Textarea
                placeholder="Any specific SEO requirements or notes..."
                value={formData.seoNotes}
                onChange={(e) => setFormData({ ...formData, seoNotes: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                Continue to Publish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Your Article is Ready!</h3>
              <p className="text-gray-600">
                Your AI-generated article has been optimized and is ready for editing or publishing.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
              <h4 className="font-semibold mb-3">Article Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium">{formData.topic}</span>
                </div>
                {formData.keywords && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keywords:</span>
                    <span className="font-medium">{formData.keywords.split(',').length} keywords</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated reading time:</span>
                  <span className="font-medium">5-7 minutes</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleStartWriting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
              >
                <PenTool className="w-5 h-5 mr-2" />
                Open in Article Editor
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back to Edit
                </Button>
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <PenTool className="w-6 h-6" />
            AI Article Writer
          </CardTitle>
          <CardDescription className="text-base">
            Create engaging, SEO-optimized content in minutes with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={`text-center p-4 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center ${
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
                  <h4 className="font-medium text-sm mb-2">{step.title}</h4>
                  <p className="text-xs text-gray-600">{step.description}</p>
                  <Badge 
                    variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'} 
                    className="text-xs mt-2"
                  >
                    {isCompleted ? 'Complete' : isCurrent ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>

          <Card className="border-0 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xl">
                {STEPS[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription className="text-base">
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
