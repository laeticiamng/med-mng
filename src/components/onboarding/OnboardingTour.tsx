import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, ArrowRight, ArrowLeft, Play, BookOpen, 
  Music, BarChart3, Users, Target, CheckCircle 
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface OnboardingTourProps {
  isVisible?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isVisible = false,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur MED-MNG !',
      description: 'Découvrez la plateforme médicale nouvelle génération qui révolutionne l\'apprentissage avec l\'IA.',
      icon: Play,
      target: 'body',
      position: 'bottom'
    },
    {
      id: 'navigation',
      title: 'Navigation Intuitive',
      description: 'Utilisez la barre de navigation pour accéder rapidement à toutes les fonctionnalités.',
      icon: Target,
      target: 'nav',
      position: 'bottom'
    },
    {
      id: 'generator',
      title: 'Générateur Musical Médical',
      description: 'Créez du contenu musical éducatif personnalisé grâce à notre IA avancée.',
      icon: Music,
      target: '[href="/generator"]',
      position: 'bottom',
      action: 'Essayer maintenant'
    },
    {
      id: 'library',
      title: 'Bibliothèque EDN Complète',
      description: 'Accédez à des milliers de ressources médicales certifiées et interactives.',
      icon: BookOpen,
      target: '[href="/edn-complete"]',
      position: 'bottom',
      action: 'Explorer'
    },
    {
      id: 'analytics',
      title: 'Suivi de Performance',
      description: 'Analysez vos progrès avec des tableaux de bord détaillés et des métriques personnalisées.',
      icon: BarChart3,
      target: '[href="/dashboard"]',
      position: 'bottom',
      action: 'Voir mes stats'
    },
    {
      id: 'community',
      title: 'Communauté Active',
      description: 'Rejoignez une communauté de professionnels de santé et partagez vos expériences.',
      icon: Users,
      target: '[href="/community"]',
      position: 'top',
      action: 'Rejoindre'
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex !== currentStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsAnimating(false);
      }, 150);
    }
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];
  const Icon = currentTourStep.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Tour Card */}
      <div className="relative animate-scale-in">
        <Card className="medical-card-premium w-full max-w-md mx-auto">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1} / {tourSteps.length}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className={`mb-6 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <h3 className="text-lg font-semibold mb-2">
                {currentTourStep.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {currentTourStep.description}
              </p>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentStep 
                      ? 'bg-primary w-6' 
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex-1 medical-btn-primary"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip option */}
            <div className="text-center mt-4">
              <button
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Passer la visite guidée
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};