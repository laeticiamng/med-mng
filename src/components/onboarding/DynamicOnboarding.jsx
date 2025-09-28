import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, X, Lightbulb } from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Med-MNG',
    description: 'Découvrez les fonctionnalités principales de votre plateforme médicale.',
    icon: Lightbulb,
    action: 'Commencer la visite'
  },
  {
    id: 'navigation',
    title: 'Navigation Intelligente',
    description: 'Utilisez Ctrl+K pour accéder rapidement à toutes les fonctionnalités.',
    icon: ArrowRight,
    action: 'Tester la navigation'
  },
  {
    id: 'dashboard',
    title: 'Tableau de Bord',
    description: 'Consultez vos métriques et indicateurs en temps réel.',
    icon: CheckCircle,
    action: 'Voir le dashboard'
  }
];

export const DynamicOnboarding = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    // Show onboarding for new users or when explicitly requested
    const hasSeenOnboarding = localStorage.getItem('med-mng-onboarding-completed');
    const showOnboarding = localStorage.getItem('med-mng-show-onboarding');
    
    if (!hasSeenOnboarding || showOnboarding === 'true') {
      setIsVisible(true);
      localStorage.removeItem('med-mng-show-onboarding');
    }
  }, []);

  const completeStep = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      localStorage.setItem('med-mng-onboarding-completed', 'true');
      setIsVisible(false);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('med-mng-onboarding-completed', 'true');
    setIsVisible(false);
  };

  const progress = (completedSteps.size / onboardingSteps.length) * 100;
  const currentStepData = onboardingSteps[currentStep];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={skipOnboarding}
        >
          <X className="w-4 h-4" />
        </Button>
        
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">
              Étape {currentStep + 1} / {onboardingSteps.length}
            </Badge>
            <currentStepData.icon className="w-5 h-5 text-primary" />
          </div>
          
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <CardDescription className="text-base">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Progress value={progress} className="w-full" />
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={skipOnboarding}>
              Passer
            </Button>
            <Button onClick={() => completeStep(currentStepData.id)}>
              {currentStepData.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicOnboarding;