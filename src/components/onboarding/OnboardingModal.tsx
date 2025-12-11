import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitize';
import { useActivityTracking } from '@/hooks/useActivityTracking';

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
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (isActive && steps.length > 0) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'onboarding_modal', action: 'view', step: currentStep }
      });
    }
  }, [isActive, currentStep, logActivity, steps.length]);

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (step) {
      completeStep(step.key);
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'onboarding_modal', action: 'complete_step', stepKey: step.key }
      });
    }
    
    if (isLastStep) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'onboarding_modal', action: 'complete_onboarding' }
      });
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  return (
    <Dialog open={isActive} onOpenChange={(open) => !open && skipOnboarding()}>
      <DialogContent className="bg-background border-border shadow-lg max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground text-lg font-semibold">
              Bienvenue ! Découvrez votre plateforme médicale
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Étape {currentStep + 1} sur {steps.length}</span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {step && (
            <div className="space-y-4 py-2">
              <h3 className="text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <div 
                className="text-muted-foreground leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.body || '') }}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={skipOnboarding}
                className="text-muted-foreground hover:text-foreground"
              >
                Passer
              </Button>
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
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