import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { ClinicalCase, ClinicalStep, CaseProgress } from '@/hooks/useClinicalCases';

export const useAIClinicalCases = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiCases, setAiCases] = useState<ClinicalCase[]>([]);
  const [currentProgress, setCurrentProgress] = useState<CaseProgress | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  // Load saved AI cases from database
  const loadAICases = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_clinical_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading AI cases:', error);
        return [];
      }

      const cases: ClinicalCase[] = (data || []).map(c => ({
        id: c.id,
        title: c.title,
        specialty: c.specialty,
        difficulty: c.difficulty as 'beginner' | 'intermediate' | 'advanced',
        description: c.description || '',
        patientPresentation: c.patient_presentation,
        steps: (c.steps as unknown) as ClinicalStep[],
        relatedItems: c.related_items || [],
        estimatedTime: c.estimated_time || 15,
        learningObjectives: c.learning_objectives || []
      }));

      setAiCases(cases);
      return cases;
    } catch (error) {
      console.error('Error in loadAICases:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a new AI case via edge function
  const generateCase = useCallback(async (
    specialty: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    relatedItems: string[] = []
  ): Promise<ClinicalCase | null> => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-clinical-case', {
        body: { specialty, difficulty, relatedItems }
      });

      if (error) {
        console.error('Error generating case:', error);
        toast({
          title: "Erreur de génération",
          description: "Impossible de générer le cas clinique. Veuillez réessayer.",
          variant: "destructive"
        });
        return null;
      }

      if (!data || !data.title) {
        toast({
          title: "Erreur",
          description: "Le cas généré est invalide",
          variant: "destructive"
        });
        return null;
      }

      // Save to database
      const { data: savedCase, error: saveError } = await supabase
        .from('ai_clinical_cases')
        .insert({
          title: data.title,
          specialty: data.specialty,
          difficulty: data.difficulty,
          description: data.description,
          patient_presentation: data.patientPresentation,
          steps: data.steps,
          related_items: data.relatedItems || relatedItems,
          estimated_time: data.estimatedTime || 15,
          learning_objectives: data.learningObjectives || [],
          generated_by: 'ai'
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving case:', saveError);
      }

      const newCase: ClinicalCase = {
        id: savedCase?.id || data.id || crypto.randomUUID(),
        title: data.title,
        specialty: data.specialty,
        difficulty: data.difficulty,
        description: data.description || '',
        patientPresentation: data.patientPresentation,
        steps: data.steps,
        relatedItems: data.relatedItems || relatedItems,
        estimatedTime: data.estimatedTime || 15,
        learningObjectives: data.learningObjectives || []
      };

      setAiCases(prev => [newCase, ...prev]);

      toast({
        title: "Cas clinique généré",
        description: `"${newCase.title}" est prêt`,
      });

      return newCase;
    } catch (error) {
      console.error('Error in generateCase:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le cas clinique",
        variant: "destructive"
      });
      return null;
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  // Start a case
  const startCase = useCallback((caseId: string): CaseProgress | null => {
    const clinicalCase = aiCases.find(c => c.id === caseId);
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
  }, [aiCases]);

  // Submit decision
  const submitDecision = useCallback((
    optionId: string,
    timeSpent: number
  ): { isCorrect: boolean; feedback: string } | null => {
    if (!currentProgress) return null;

    const clinicalCase = aiCases.find(c => c.id === currentProgress.caseId);
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
      feedback: selectedOption.feedback
    };
  }, [currentProgress, aiCases]);

  // Complete case
  const completeCase = useCallback(async (userId: string) => {
    if (!currentProgress) return null;

    const completedProgress = {
      ...currentProgress,
      completedAt: new Date().toISOString()
    };

    const score = currentProgress.totalAnswers > 0
      ? Math.round((currentProgress.correctAnswers / currentProgress.totalAnswers) * 100)
      : 0;

    // Log activity
    const totalTime = currentProgress.decisions.reduce((sum, d) => sum + d.timeSpent, 0);
    await logActivity({
      activity_type: 'clinical_case',
      count: 1,
      duration_seconds: Math.round(totalTime / 1000),
      score,
      metadata: {
        case_id: currentProgress.caseId,
        steps_completed: currentProgress.completedSteps.length,
        ai_generated: true
      }
    });

    // Update use count in database
    try {
      const { data: currentCase } = await supabase
        .from('ai_clinical_cases')
        .select('use_count')
        .eq('id', currentProgress.caseId)
        .single();
      
      if (currentCase) {
        await supabase
          .from('ai_clinical_cases')
          .update({ use_count: (currentCase.use_count || 0) + 1 })
          .eq('id', currentProgress.caseId);
      }
    } catch (e) {
      console.error('Error updating use count:', e);
    }

    // Save to Supabase
    try {
      await (supabase as any)
        .from('clinical_case_history')
        .insert({
          user_id: userId,
          case_id: currentProgress.caseId,
          score,
          completed_steps: completedProgress.completedSteps,
          correct_answers: completedProgress.correctAnswers,
          total_answers: completedProgress.totalAnswers,
          decisions: completedProgress.decisions,
          started_at: completedProgress.startedAt,
          completed_at: completedProgress.completedAt
        });
    } catch (e) {
      console.error('Error saving clinical history:', e);
    }

    setCurrentProgress(null);

    toast({
      title: "Cas clinique terminé !",
      description: `Score: ${score}%`,
    });

    return completedProgress;
  }, [currentProgress, logActivity, toast]);

  // Get current case
  const getCurrentCase = useCallback((): ClinicalCase | null => {
    if (!currentProgress) return null;
    return aiCases.find(c => c.id === currentProgress.caseId) || null;
  }, [currentProgress, aiCases]);

  // Get available specialties
  const getSpecialties = useCallback((): string[] => {
    const specialties = new Set(aiCases.map(c => c.specialty));
    return [
      'Cardiologie',
      'Pneumologie',
      'Neurologie',
      'Gastro-entérologie',
      'Néphrologie',
      'Endocrinologie',
      'Rhumatologie',
      'Pédiatrie',
      'Gynécologie',
      'Psychiatrie',
      'Urgences',
      'Infectiologie',
      ...specialties
    ].filter((v, i, a) => a.indexOf(v) === i);
  }, [aiCases]);

  return {
    loading,
    generating,
    aiCases,
    currentProgress,
    loadAICases,
    generateCase,
    startCase,
    submitDecision,
    completeCase,
    getCurrentCase,
    getSpecialties
  };
};
