/**
 * Tour guidé interactif pour l'onboarding utilisateur
 * Améliore l'expérience des nouveaux utilisateurs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Lightbulb, 
  Navigation,
  Search,
  Music,
  BookOpen,
  Target 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple localStorage hook
const useLocalStorage = (key: string, defaultValue: boolean) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: boolean) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      // Ignore localStorage errors
    }
  };

  return [value, setStoredValue] as const;
};

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ComponentType<any>;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur MED-MNG',
    description: 'Découvrez votre plateforme d\'apprentissage médical avec IA musicale. Ce tour vous guidera à travers les fonctionnalités principales.',
    target: 'body',
    icon: Lightbulb,
    position: 'bottom'
  },
  {
    id: 'navigation',
    title: 'Navigation Principale',
    description: 'Accédez facilement à vos items EDN, cas ECOS et bibliothèque musicale depuis cette barre de navigation.',
    target: '[data-tour="navigation"]',
    icon: Navigation,
    position: 'bottom'
  },
  {
    id: 'search',
    title: 'Recherche Intelligente',
    description: 'Utilisez la recherche pour trouver rapidement des items par code, thème ou mot-clé.',
    target: '[data-tour="search"]',
    icon: Search,
    position: 'bottom'
  },
  {
    id: 'edn-items',
    title: 'Items EDN',
    description: 'Explorez les items EDN organisés selon le référentiel E-LiSA officiel avec tableaux enrichis.',
    target: '[data-tour="edn"]',
    icon: BookOpen,
    position: 'right'
  },
  {
    id: 'music-generator',
    title: 'Générateur Musical IA',
    description: 'Créez des mnémotechniques musicales personnalisées avec notre IA pour mémoriser vos cours.',
    target: '[data-tour="generator"]',
    icon: Music,
    position: 'left'
  },
  {
    id: 'profile',
    title: 'Votre Profil',
    description: 'Suivez vos progrès, personnalisez vos préférences et gérez votre bibliothèque personnelle.',
    target: '[data-tour="profile"]',
    icon: Target,
    position: 'bottom'
  }
];

interface OnboardingTourProps {
  isOpen?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen: externalIsOpen,
  onComplete,
  onSkip
}) => {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('onboarding-tour-seen', false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(externalIsOpen ?? !hasSeenTour);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      const target = document.querySelector(tourSteps[currentStep].target) as HTMLElement;
      setTargetElement(target);
      
      // Scroll vers l'élément cible
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Ajouter focus temporaire pour la démonstration
        target.style.outline = '2px solid hsl(var(--primary))';
        target.style.outlineOffset = '4px';
        target.style.borderRadius = '8px';
        
        return () => {
          target.style.outline = '';
          target.style.outlineOffset = '';
          target.style.borderRadius = '';
        };
      }
    }
  }, [currentStep, isOpen]);

  const nextStep = () => {
    const step = tourSteps[currentStep];
    if (step.action) {
      step.action();
    }
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsOpen(false);
    setHasSeenTour(true);
    onComplete?.();
  };

  const skipTour = () => {
    setIsOpen(false);
    setHasSeenTour(true);
    onSkip?.();
  };

  const resetTour = () => {
    setCurrentStep(0);
    setHasSeenTour(false);
    setIsOpen(true);
  };

  const getCurrentStepData = () => tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={resetTour}
        className="fixed bottom-4 left-4 z-40 shadow-lg"
        title="Rejouer le tour guidé"
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        Aide
      </Button>
    );
  }

  const step = getCurrentStepData();
  const Icon = step.icon;

  return (
    <>
      {/* Overlay semi-transparent */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
      
      {/* Tour Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md mx-4"
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      Étape {currentStep + 1}/{tourSteps.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipTour}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{step.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progression</span>
                  <span>{currentStep + 1}/{tourSteps.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="text-muted-foreground"
                  >
                    Passer
                  </Button>
                </div>
                
                <Button onClick={nextStep} size="sm">
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      Terminer
                      <Target className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

// Hook pour contrôler le tour depuis n'importe où
export const useOnboardingTour = () => {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('onboarding-tour-seen', false);
  
  const startTour = () => {
    setHasSeenTour(false);
  };
  
  const skipTour = () => {
    setHasSeenTour(true);
  };
  
  return {
    hasSeenTour,
    startTour,
    skipTour,
    shouldShowTour: !hasSeenTour
  };
};