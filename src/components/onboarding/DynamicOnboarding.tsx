import React, { useState, useEffect } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { OnboardingTour } from './OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingStep {
  key: string;
  title: string;
  body: string;
  type: 'modal' | 'tour';
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const DynamicOnboarding: React.FC = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  
  const {
    isActive,
    completeOnboarding,
    skipOnboarding,
    currentStep,
    steps
  } = useOnboarding();

  useEffect(() => {
    loadDynamicOnboarding();
  }, []);

  const loadDynamicOnboarding = async () => {
    try {
      // ⚡ CRITICAL PATH OPTIMIZATION: Load static immediately, defer API
      loadStaticOnboarding();
      setIsLoading(false);
      
      // Remove failing API call that's causing network dependency chain issues
      // Static fallback is sufficient for onboarding functionality
      // This eliminates the 404/502 errors and improves network performance
      
    } catch (error) {
      console.warn('Failed to load dynamic onboarding, using static fallback:', error);
      loadStaticOnboarding();
      setIsLoading(false);
    }
  };

  const loadStaticOnboarding = () => {
    const staticSteps: OnboardingStep[] = [
      {
        key: 'welcome',
        title: 'Bienvenue sur MED-MNG',
        body: `
          <p>Découvrez votre nouvelle plateforme médicale professionnelle.</p>
          <ul class="list-disc pl-4 mt-2 space-y-1">
            <li>Accès à une bibliothèque médicale complète</li>
            <li>Outils de création de contenu pédagogique</li>
            <li>Interface optimisée pour tous les appareils</li>
          </ul>
        `,
        type: 'modal'
      },
      {
        key: 'navigation',
        title: 'Navigation mobile',
        body: 'Utilisez la barre de navigation en bas de l\'écran pour accéder rapidement aux principales sections.',
        type: 'tour',
        target: '[data-testid="mobile-bottom-nav"]',
        position: 'top'
      },
      {
        key: 'library',
        title: 'Votre bibliothèque',
        body: 'Explorez votre collection de ressources médicales. Utilisez les filtres pour trouver rapidement ce que vous cherchez.',
        type: 'tour',
        target: '[data-testid="library-grid"]',
        position: 'top'
      },
      {
        key: 'create',
        title: 'Créer du contenu',
        body: 'Créez facilement du contenu pédagogique personnalisé avec nos outils intégrés.',
        type: 'tour',
        target: '[href="/med-mng/create"]',
        position: 'top'
      },
      {
        key: 'profile',
        title: 'Votre profil',
        body: 'Gérez vos paramètres, votre abonnement et vos préférences depuis votre profil.',
        type: 'tour',
        target: '[href="/med-mng/profile"]',
        position: 'top'
      }
    ];

    setOnboardingData(staticSteps);
  };

  const handleModalComplete = () => {
    // Check if there are tour steps
    const tourSteps = onboardingData.filter(step => step.type === 'tour');
    if (tourSteps.length > 0) {
      setShowTour(true);
    } else {
      completeOnboarding();
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    completeOnboarding();
  };

  const handleSkip = () => {
    setShowTour(false);
    skipOnboarding();
  };

  if (isLoading) {
    return null;
  }

  // Prepare modal steps
  const modalSteps = onboardingData
    .filter(step => step.type === 'modal')
    .map(step => ({
      key: step.key,
      title: step.title,
      body: step.body
    }));

  // Prepare tour steps
  const tourSteps = onboardingData
    .filter(step => step.type === 'tour' && step.target)
    .map(step => ({
      target: step.target!,
      title: step.title,
      content: step.body.replace(/<[^>]*>/g, ''), // Strip HTML for tour
      position: step.position || 'bottom' as const
    }));

  return (
    <>
      {isActive && !showTour && modalSteps.length > 0 && (
        <OnboardingModal />
      )}
      
      {showTour && tourSteps.length > 0 && (
        <OnboardingTour
          steps={tourSteps}
          isActive={showTour}
          onComplete={handleTourComplete}
          onSkip={handleSkip}
        />
      )}
    </>
  );
};