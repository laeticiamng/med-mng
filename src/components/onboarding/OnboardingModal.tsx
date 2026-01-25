import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useOnboarding } from '@/hooks/useOnboarding';
import { sanitizeHtml } from '@/utils/sanitize';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import React, { useEffect } from 'react';

export const OnboardingModal: React.FC = () => {
  const {
    _steps,
    _currentStep,
    isActive,
    nextStep,
    previousStep,
    completeStep,
    _completeOnboarding,
    _skipOnboarding,
    _isCompleted
  } = useOnboarding();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (isActive && _steps.length > 0) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'onboarding_modal', action: 'view', step: _currentStep }
      });
    }
  }, [isActive, _currentStep, logActivity, _steps.length]);

  if (!isActive || _steps.length === 0) return null;

  const step = _steps[_currentStep];
  const progress = ((_currentStep + 1) / _steps.length) * 100;
  const isLastStep = _currentStep === _steps.length - 1;

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
      _completeOnboarding();
    } else {
      nextStep();
    }
  };

  return (
    <Dialog open={isActive} onOpenChange={(open) => !open && _skipOnboarding()}>
      <DialogContent className="bg-background border-border shadow-lg max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground text-lg font-semibold">
              Bienvenue ! Découvrez votre plateforme médicale
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={_skipOnboarding}
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
              <span>Étape {_currentStep + 1} sur {_steps.length}</span>
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
              disabled={_currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={_skipOnboarding}
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