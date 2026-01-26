import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingModal } from './OnboardingModal';

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
  const [showTour, _setShowTour] = useState(false);
  const { logActivity: _logActivity } = useActivityTracking();
  const { loadStats } = useGamification();
  const [, setUser] = useState<any>(null);

  // ✅ Only show onboarding on homepage
  const shouldShowOnboarding = location.pathname === '/';

  const {
    isActive,
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
      // ⚡ OPTIMISATION : Use static onboarding (no API endpoint in Lovable)
      loadStaticOnboarding();
      setIsLoading(false);
      
      // Try to load dynamic onboarding from Supabase edge function if available
      try {
        const { data, error } = await supabase.functions.invoke('get-onboarding-steps', {
          body: {}
        });

        if (!error && data?.steps && data.steps.length > 0) {
          setOnboardingData(data.steps);
        }
      } catch {
        // Edge function not available, use static fallback (this is expected)
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
  return (
    <>
      {isActive && shouldShowOnboarding && !showTour && modalSteps.length > 0 && (
        <OnboardingModal />
      )}
      
      {/* Tour simplifié - composant supprimé */}
    </>
  );
};