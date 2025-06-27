
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { OnboardingLayout } from '@/components/Onboarding/OnboardingLayout';
import { ProfileSetupStep } from '@/components/Onboarding/ProfileSetupStep';
import { CompanySetupStep } from '@/components/Onboarding/CompanySetupStep';
import { ContentStrategyStep } from '@/components/Onboarding/ContentStrategyStep';
import { WebflowIntegrationStep } from '@/components/Onboarding/WebflowIntegrationStep';
import { CompletionStep } from '@/components/Onboarding/CompletionStep';

const Onboarding = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    fullName: '',
    companyName: '',
    websiteUrl: '',
    industry: '',
    targetAudience: '',
    contentGoals: [] as string[],
    preferredTone: 'professional',
    webflowConnected: false,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateOnboardingData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({...prev, ...data}));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfileSetupStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <CompanySetupStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <ContentStrategyStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <WebflowIntegrationStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <CompletionStep
            data={onboardingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={totalSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;
