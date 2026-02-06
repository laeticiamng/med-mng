import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
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

  const loadUserProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState(prev => ({ ...prev, completedSteps: [], isActive: false }));
      return;
    }
    
    const { data } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setState(prev => ({
      ...prev,
      completedSteps: (Array.isArray(data?.completed_steps) ? data.completed_steps : []) as string[],
      isActive: data?.is_active || false
    }));
  };

  const startOnboarding = async () => {
    setState(prev => ({ ...prev, isActive: true, currentStep: 0 }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_onboarding').upsert({
        user_id: user.id,
        is_active: true,
        current_step: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
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

  const completeStep = async (stepKey: string) => {
    const updated = [...state.completedSteps, stepKey];
    setState(prev => ({ ...prev, completedSteps: updated }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_onboarding').upsert({
        user_id: user.id,
        completed_steps: updated,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  };

  const completeOnboarding = async () => {
    setState(prev => ({ ...prev, isActive: false }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_onboarding').upsert({
        user_id: user.id,
        is_active: false,
        is_seen: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  };

  const _skipOnboarding = async () => {
    await completeOnboarding();
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
  const resetOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_onboarding').delete().eq('user_id', user.id);
    }
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
  const markTooltipAsSeen = async (tooltipKey: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('user_onboarding')
      .select('seen_tooltips')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const seenTooltips: string[] = Array.isArray(data?.seen_tooltips) ? (data.seen_tooltips as string[]) : [];
    if (!seenTooltips.includes(tooltipKey)) {
      seenTooltips.push(tooltipKey);
      await supabase.from('user_onboarding').upsert({
        user_id: user.id,
        seen_tooltips: seenTooltips,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  };

  // Vérifier si un tooltip a été vu
  const isTooltipSeen = async (tooltipKey: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data } = await (supabase as any)
      .from('user_onboarding')
      .select('seen_tooltips')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return (data?.seen_tooltips || []).includes(tooltipKey);
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
    skipOnboarding: completeOnboarding,
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