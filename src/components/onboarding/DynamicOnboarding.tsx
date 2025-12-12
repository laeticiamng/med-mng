import React, { useState, useEffect } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useLocation } from 'react-router-dom';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  key: string;
  title: string;
  body: string;
  type: 'modal' | 'tour';
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const DynamicOnboarding: React.FC = () => {
  const location = useLocation();
  const [onboardingData, setOnboardingData] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const { logActivity } = useActivityTracking();
  const { addPoints, loadStats } = useGamification();
  const [user, setUser] = useState<any>(null);
  
  // ✅ Only show onboarding on homepage
  const shouldShowOnboarding = location.pathname === '/';
  
  const {
    isActive,
    completeOnboarding,
    skipOnboarding,
    currentStep,
    steps
  } = useOnboarding();

  // Check user on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) loadStats(user.id);
    };
    checkUser();
  }, [loadStats]);

  useEffect(() => {
    loadDynamicOnboarding();
  }, []);

  const loadDynamicOnboarding = async () => {
    try {
      // ⚡ OPTIMISATION : Pas d'attente pour l'API - démarrer avec le static d'abord
      loadStaticOnboarding();
      setIsLoading(false);
      
      // Charger l'API en arrière-plan sans bloquer l'interface
      const response = await fetch('/api/med-mng/help/onboarding', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.steps && data.steps.length > 0) {
          setOnboardingData(data.steps); // Mettre à jour seulement si l'API a du contenu
        }
      }
    } catch (error) {
      console.warn('Failed to load dynamic onboarding, using static fallback:', error);
      loadStaticOnboarding();
    } finally {
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

  const handleModalComplete = async () => {
    // Log onboarding completion activity
    if (user) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { action: 'onboarding_modal_complete' }
      });
      // Award points for completing onboarding
      await addPoints(user.id, 'itemReviewed');
    }
    
    // Check if there are tour steps
    const tourSteps = onboardingData.filter(step => step.type === 'tour');
    if (tourSteps.length > 0) {
      setShowTour(true);
    } else {
      completeOnboarding();
    }
  };

  const handleTourComplete = async () => {
    // Log tour completion activity
    if (user) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { action: 'onboarding_tour_complete' }
      });
      // Award points for completing tour
      await addPoints(user.id, 'itemReviewed');
    }
    
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
      {isActive && shouldShowOnboarding && !showTour && modalSteps.length > 0 && (
        <OnboardingModal />
      )}
      
      {/* Tour simplifié - composant supprimé */}
    </>
  );
};