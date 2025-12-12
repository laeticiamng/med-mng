import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryCache } from './useQueryCache';

export interface OnboardingStep {
  id: string;
  key: string;
  title: string;
  body: string;
  type: 'onboarding' | 'tooltip' | 'help';
  version: number;
  is_active: boolean;
}

interface OnboardingState {
  steps: OnboardingStep[];
  currentStep: number;
  isActive: boolean;
  completedSteps: string[];
}

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    steps: [],
    currentStep: 0,
    isActive: false,
    completedSteps: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, []);

  // Use cached query to prevent duplicates
  const { data: stepsData, loading: stepsLoading } = useQueryCache(
    'onboarding_steps',
    async () => {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'onboarding')
        .order('id');

      if (error) throw error;

      // Transform database data to OnboardingStep format
      return (data || []).map(row => ({
        id: row.id,
        key: row.key,
        title: typeof row.title === 'object' ? (row.title as any)?.fr || (row.title as any)?.en || '' : String(row.title),
        body: typeof row.body === 'object' ? (row.body as any)?.fr || (row.body as any)?.en || '' : String(row.body),
        type: row.type as 'onboarding' | 'tooltip' | 'help',
        version: row.version,
        is_active: row.is_active
      })) as OnboardingStep[];
    },
    { ttl: 10 * 60 * 1000 } // 10 minutes cache
  );

  useEffect(() => {
    if (stepsData) {
      setState(prev => ({ ...prev, steps: stepsData }));
    }
    setLoading(stepsLoading);
  }, [stepsData, stepsLoading]);

  const loadUserProgress = () => {
    const completed = JSON.parse(localStorage.getItem('onboarding_completed') || '[]');
    
    // 🔒 ONBOARDING DÉSACTIVÉ PAR DÉFAUT
    // L'utilisateur doit manuellement activer l'onboarding via startOnboarding()
    // Cela évite le modal invasif sur toutes les pages
    setState(prev => ({
      ...prev,
      completedSteps: completed,
      isActive: false // ✅ TOUJOURS désactivé par défaut
    }));
  };

  const startOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0
    }));
    localStorage.setItem('onboarding_active', 'true');
  };

  const nextStep = () => {
    setState(prev => {
      const newStep = Math.min(prev.currentStep + 1, prev.steps.length - 1);
      return { ...prev, currentStep: newStep };
    });
  };

  const previousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  };

  const completeStep = (stepKey: string) => {
    const updated = [...state.completedSteps, stepKey];
    setState(prev => ({
      ...prev,
      completedSteps: updated
    }));
    localStorage.setItem('onboarding_completed', JSON.stringify(updated));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: false
    }));
    localStorage.setItem('onboarding_active', 'false');
    localStorage.setItem('onboarding_seen', 'true'); // ✅ Mark as seen permanently
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_seen', 'true'); // ✅ Mark as seen even if skipped
    completeOnboarding();
  };

  // Aller directement à une étape spécifique
  const goToStep = (stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(stepIndex, prev.steps.length - 1))
    }));
  };

  // Obtenir l'étape courante
  const getCurrentStep = (): OnboardingStep | null => {
    return state.steps[state.currentStep] || null;
  };

  // Progression totale
  const getProgress = (): number => {
    if (state.steps.length === 0) return 0;
    return Math.round(((state.currentStep + 1) / state.steps.length) * 100);
  };

  // Nombre d'étapes restantes
  const getRemainingSteps = (): number => {
    return Math.max(0, state.steps.length - state.currentStep - 1);
  };

  // Vérifier si c'est la première étape
  const isFirstStep = (): boolean => {
    return state.currentStep === 0;
  };

  // Vérifier si c'est la dernière étape
  const isLastStep = (): boolean => {
    return state.currentStep === state.steps.length - 1;
  };

  // Réinitialiser l'onboarding
  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_active');
    localStorage.removeItem('onboarding_seen');
    setState({
      steps: state.steps,
      currentStep: 0,
      isActive: false,
      completedSteps: []
    });
  };

  // Obtenir les tooltips pour une page donnée
  const getTooltipsForPage = (pageKey: string): OnboardingStep[] => {
    return state.steps.filter(s =>
      s.type === 'tooltip' && s.key.startsWith(pageKey)
    );
  };

  // Marquer un tooltip comme vu
  const markTooltipAsSeen = (tooltipKey: string) => {
    const seenTooltips = JSON.parse(localStorage.getItem('seen_tooltips') || '[]');
    if (!seenTooltips.includes(tooltipKey)) {
      seenTooltips.push(tooltipKey);
      localStorage.setItem('seen_tooltips', JSON.stringify(seenTooltips));
    }
  };

  // Vérifier si un tooltip a été vu
  const isTooltipSeen = (tooltipKey: string): boolean => {
    const seenTooltips = JSON.parse(localStorage.getItem('seen_tooltips') || '[]');
    return seenTooltips.includes(tooltipKey);
  };

  // Statistiques d'onboarding
  const getOnboardingStats = () => {
    return {
      totalSteps: state.steps.length,
      completedSteps: state.completedSteps.length,
      currentStep: state.currentStep + 1,
      progress: getProgress(),
      isComplete: state.completedSteps.length === state.steps.length
    };
  };

  return {
    ...state,
    loading,
    startOnboarding,
    nextStep,
    previousStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    goToStep,
    getCurrentStep,
    getProgress,
    getRemainingSteps,
    isFirstStep,
    isLastStep,
    resetOnboarding,
    getTooltipsForPage,
    markTooltipAsSeen,
    isTooltipSeen,
    getOnboardingStats,
    isCompleted: (stepKey: string) => state.completedSteps.includes(stepKey)
  };
};