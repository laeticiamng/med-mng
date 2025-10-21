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
    
    // ✅ CRITICAL FIX: Set onboarding as seen by default for all users
    // This prevents the modal from showing on every page
    if (localStorage.getItem('onboarding_seen') === null) {
      localStorage.setItem('onboarding_seen', 'true');
    }
    
    const hasSeenOnboarding = localStorage.getItem('onboarding_seen') === 'true';
    const isActive = !hasSeenOnboarding; // Will be false by default now
    
    setState(prev => ({
      ...prev,
      completedSteps: completed,
      isActive
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

  return {
    ...state,
    loading,
    startOnboarding,
    nextStep,
    previousStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    isCompleted: (stepKey: string) => state.completedSteps.includes(stepKey)
  };
};