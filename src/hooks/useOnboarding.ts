import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    loadOnboardingSteps();
    loadUserProgress();
  }, []);

  const loadOnboardingSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'onboarding')
        .order('id');

      if (error) throw error;

      setState(prev => ({
        ...prev,
        steps: data || []
      }));
    } catch (error) {
      console.error('Error loading onboarding steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = () => {
    const completed = JSON.parse(localStorage.getItem('onboarding_completed') || '[]');
    const isActive = localStorage.getItem('onboarding_active') !== 'false';
    
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
  };

  const skipOnboarding = () => {
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