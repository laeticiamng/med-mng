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
  _steps: OnboardingStep[];
  _currentStep: number;
  isActive: boolean;
  completedSteps: string[];
}

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    _steps: [],
    _currentStep: 0,
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
      const { _data, _error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'onboarding')
        .order('id');

      if (_error) throw _error;

      // Transform database data to OnboardingStep format
      return (_data || []).map(row => ({
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
      setState(prev => ({ ...prev, _steps: stepsData }));
    }
    setLoading(stepsLoading);
  }, [stepsData, stepsLoading]);

  const loadUserProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState(prev => ({ ...prev, completedSteps: [], isActive: false }));
      return;
    }
    
    const { data } = await (supabase as any)
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setState(prev => ({
      ...prev,
      completedSteps: data?.completed_steps || [],
      isActive: data?.is_active || false
    }));
  };

  const startOnboarding = async () => {
    setState(prev => ({ ...prev, isActive: true, _currentStep: 0 }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_onboarding').upsert({
        user_id: user.id,
        is_active: true,
        current_step: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  };

  const nextStep = () => {
    setState(prev => {
      const newStep = Math.min(prev._currentStep + 1, prev._steps.length - 1);
      return { ...prev, _currentStep: newStep };
    });
  };

  const previousStep = () => {
    setState(prev => ({
      ...prev,
      _currentStep: Math.max(prev._currentStep - 1, 0)
    }));
  };

  const completeStep = async (stepKey: string) => {
    const updated = [...state.completedSteps, stepKey];
    setState(prev => ({ ...prev, completedSteps: updated }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_onboarding').upsert({
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
      await (supabase as any).from('user_onboarding').upsert({
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
      _currentStep: Math.max(0, Math.min(stepIndex, prev._steps.length - 1))
    }));
  };

  // Obtenir l'étape courante
  const getCurrentStep = (): OnboardingStep | null => {
    return state._steps[state._currentStep] || null;
  };

  // Progression totale
  const getProgress = (): number => {
    if (state._steps.length === 0) return 0;
    return Math.round(((state._currentStep + 1) / state._steps.length) * 100);
  };

  // Nombre d'étapes restantes
  const getRemainingSteps = (): number => {
    return Math.max(0, state._steps.length - state._currentStep - 1);
  };

  // Vérifier si c'est la première étape
  const isFirstStep = (): boolean => {
    return state._currentStep === 0;
  };

  // Vérifier si c'est la dernière étape
  const isLastStep = (): boolean => {
    return state._currentStep === state._steps.length - 1;
  };

  // Réinitialiser l'onboarding
  const resetOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_onboarding').delete().eq('user_id', user.id);
    }
    setState({
      _steps: state._steps,
      _currentStep: 0,
      isActive: false,
      completedSteps: []
    });
  };

  // Obtenir les tooltips pour une page donnée
  const getTooltipsForPage = (pageKey: string): OnboardingStep[] => {
    return state._steps.filter(s =>
      s.type === 'tooltip' && s.key.startsWith(pageKey)
    );
  };

  // Marquer un tooltip comme vu
  const markTooltipAsSeen = async (tooltipKey: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await (supabase as any)
      .from('user_onboarding')
      .select('seen_tooltips')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const seenTooltips = data?.seen_tooltips || [];
    if (!seenTooltips.includes(tooltipKey)) {
      seenTooltips.push(tooltipKey);
      await (supabase as any).from('user_onboarding').upsert({
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
      totalSteps: state._steps.length,
      completedSteps: state.completedSteps.length,
      currentStep: state._currentStep + 1,
      progress: getProgress(),
      isComplete: state.completedSteps.length === state._steps.length
    };
  };

  return {
    ...state,
    loading,
    startOnboarding,
    nextStep,
    previousStep,
    completeStep,
    _completeOnboarding,
    _skipOnboarding,
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
    _isCompleted: (stepKey: string) => state.completedSteps.includes(stepKey)
  };
};