import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    steps,
    currentStep,
    isActive,
    nextStep,
    previousStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    isCompleted
  } = useOnboarding();

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (step) {
      completeStep(step.key);
    }
    
    if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  return (
    <Dialog open={isActive} onOpenChange={() => {}}>
      <DialogContent className="medical-card max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-medical-primary">
              Bienvenue ! Découvrez votre plateforme médicale
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="text-medical-secondary hover:text-medical-primary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-medical-secondary">
              <span>Étape {currentStep + 1} sur {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {step && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-medical-primary">
                {step.title}
              </h3>
              <div 
                className="text-medical-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: step.body }}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-medical-border">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={skipOnboarding}
                className="text-medical-secondary"
              >
                Passer
              </Button>
              <Button
                onClick={handleNext}
                className="medical-btn-primary flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};