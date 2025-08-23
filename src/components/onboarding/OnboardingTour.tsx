import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

interface OnboardingTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });

      // Calculate tooltip position using requestAnimationFrame to prevent forced reflow
      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const offset = step.offset || { x: 0, y: 0 };
        
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top - 120 + offset.y;
            left = rect.left + rect.width / 2 - 150 + offset.x;
            break;
          case 'bottom':
            top = rect.bottom + 20 + offset.y;
            left = rect.left + rect.width / 2 - 150 + offset.x;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - 60 + offset.y;
            left = rect.left - 320 + offset.x;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - 60 + offset.y;
            left = rect.right + 20 + offset.x;
            break;
        }

        setTooltipPosition({ top, left });
      });

      // Highlight element
      element.style.position = 'relative';
      element.style.zIndex = '1001';
      element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 2px white';
      element.style.borderRadius = '8px';
    }

    return () => {
      if (element) {
        element.style.position = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.style.borderRadius = '';
      }
    };
  }, [currentStep, steps, isActive]);

  if (!isActive || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-1000 pointer-events-none" />
      
      {/* Tooltip */}
      <Card 
        className="fixed z-1002 w-80 medical-card shadow-xl animate-scale-in"
        style={{
          top: tooltipPosition.top,
          left: Math.max(20, Math.min(window.innerWidth - 340, tooltipPosition.left))
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <h3 className="font-semibold text-foreground mb-2">
            {step.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {step.content}
          </p>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Précédent
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground"
              >
                Passer
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-1"
              >
                {isLastStep ? (
                  <>
                    <Check className="h-3 w-3" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};