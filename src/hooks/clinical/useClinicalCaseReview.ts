import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ClinicalCase, ClinicalStep, CaseProgress } from './types';

export const useClinicalCaseReview = (cases: ClinicalCase[]) => {
  const [currentProgress, setCurrentProgress] = useState<CaseProgress | null>(null);
  const { toast } = useToast();

  // Start a clinical case
  const startCase = useCallback((caseId: string): CaseProgress | null => {
    const clinicalCase = cases.find(c => c.id === caseId);
    if (!clinicalCase) return null;

    const progress: CaseProgress = {
      caseId,
      currentStepIndex: 0,
      completedSteps: [],
      correctAnswers: 0,
      totalAnswers: 0,
      startedAt: new Date().toISOString(),
      decisions: []
    };

    setCurrentProgress(progress);
    return progress;
  }, [cases]);

  // Submit decision for current step
  const submitDecision = useCallback((
    optionId: string,
    timeSpent: number
  ): { isCorrect: boolean; feedback: string; nextStepId?: string } | null => {
    if (!currentProgress) return null;

    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase) return null;

    const currentStep = clinicalCase.steps[currentProgress.currentStepIndex];
    if (!currentStep) return null;

    const selectedOption = currentStep.options.find(o => o.id === optionId);
    if (!selectedOption) return null;

    const newDecision = {
      stepId: currentStep.id,
      selectedOption: optionId,
      wasCorrect: selectedOption.isCorrect,
      timeSpent
    };

    setCurrentProgress(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id],
        correctAnswers: prev.correctAnswers + (selectedOption.isCorrect ? 1 : 0),
        totalAnswers: prev.totalAnswers + 1,
        currentStepIndex: selectedOption.isCorrect ? prev.currentStepIndex + 1 : prev.currentStepIndex,
        decisions: [...prev.decisions, newDecision]
      };
    });

    return {
      isCorrect: selectedOption.isCorrect,
      feedback: selectedOption.feedback,
      nextStepId: selectedOption.nextStepId
    };
  }, [currentProgress, cases]);

  // Complete the case
  const completeCase = useCallback(async (_userId: string) => {
    if (!currentProgress) return null;

    const completedProgress = {
      ...currentProgress,
      completedAt: new Date().toISOString()
    };

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any)
          .from('clinical_cases_history')
          .insert({
            user_id: user.id,
            case_id: currentProgress.caseId,
            completed_steps: completedProgress.completedSteps,
            correct_answers: completedProgress.correctAnswers,
            total_answers: completedProgress.totalAnswers,
            decisions: completedProgress.decisions,
            started_at: completedProgress.startedAt,
            completed_at: completedProgress.completedAt
          });
      }
    } catch (e) {
      console.error('Error saving clinical history:', e);
    }

    const score = Math.round((currentProgress.correctAnswers / currentProgress.totalAnswers) * 100);

    toast({
      title: "Cas clinique terminé !",
      description: `Score: ${score}% (${currentProgress.correctAnswers}/${currentProgress.totalAnswers})`,
    });

    setCurrentProgress(null);
    return completedProgress;
  }, [currentProgress, toast]);

  // Get current case
  const getCurrentCase = useCallback((): ClinicalCase | null => {
    if (!currentProgress) return null;
    return cases.find(c => c.id === currentProgress.caseId) || null;
  }, [currentProgress, cases]);

  // Get current step
  const getCurrentStep = useCallback((): ClinicalStep | null => {
    if (!currentProgress) return null;
    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase) return null;
    return clinicalCase.steps[currentProgress.currentStepIndex] || null;
  }, [currentProgress, cases]);

  // Get progress percentage
  const getProgressPercentage = useCallback((): number => {
    if (!currentProgress) return 0;
    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase || clinicalCase.steps.length === 0) return 0;
    return Math.round((currentProgress.currentStepIndex / clinicalCase.steps.length) * 100);
  }, [currentProgress, cases]);

  // Get current score
  const getCurrentScore = useCallback((): number => {
    if (!currentProgress || currentProgress.totalAnswers === 0) return 0;
    return Math.round((currentProgress.correctAnswers / currentProgress.totalAnswers) * 100);
  }, [currentProgress]);

  // Is case completed
  const isCaseCompleted = useCallback((): boolean => {
    if (!currentProgress) return false;
    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase) return false;
    return currentProgress.currentStepIndex >= clinicalCase.steps.length;
  }, [currentProgress, cases]);

  // Reset current progress
  const resetProgress = useCallback(() => {
    setCurrentProgress(null);
  }, []);

  // Get time spent on current case
  const getTimeSpent = useCallback((): number => {
    if (!currentProgress) return 0;
    return currentProgress.decisions.reduce((sum, d) => sum + d.timeSpent, 0);
  }, [currentProgress]);

  // Get average time per step
  const getAverageTimePerStep = useCallback((): number => {
    if (!currentProgress || currentProgress.decisions.length === 0) return 0;
    const totalTime = currentProgress.decisions.reduce((sum, d) => sum + d.timeSpent, 0);
    return Math.round(totalTime / currentProgress.decisions.length);
  }, [currentProgress]);

  return {
    currentProgress,
    startCase,
    submitDecision,
    completeCase,
    getCurrentCase,
    getCurrentStep,
    getProgressPercentage,
    getCurrentScore,
    isCaseCompleted,
    resetProgress,
    getTimeSpent,
    getAverageTimePerStep,
  };
};
