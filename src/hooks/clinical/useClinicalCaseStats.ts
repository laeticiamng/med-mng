import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ClinicalStats } from './types';
import { SAMPLE_CASES } from './sampleCases';

export const useClinicalCaseStats = () => {
  // Get statistics from Supabase
  const getStats = useCallback(async (userId: string): Promise<ClinicalStats> => {
    try {
      const { data: history } = await (supabase as any)
        .from('clinical_cases_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (!history || history.length === 0) {
        return {
          totalCasesStarted: 0,
          totalCasesCompleted: 0,
          averageScore: 0,
          bySpecialty: {},
          recentCases: []
        };
      }

      const completed = history.filter((h: any) => h.completed_at);
      const scores = completed.map((h: any) =>
        h.total_answers > 0 ? (h.correct_answers / h.total_answers) * 100 : 0
      );

      const bySpecialty: Record<string, { completed: number; score: number }> = {};
      completed.forEach((h: any) => {
        const clinicalCase = SAMPLE_CASES.find(c => c.id === h.case_id);
        if (clinicalCase) {
          if (!bySpecialty[clinicalCase.specialty]) {
            bySpecialty[clinicalCase.specialty] = { completed: 0, score: 0 };
          }
          bySpecialty[clinicalCase.specialty].completed++;
          bySpecialty[clinicalCase.specialty].score +=
            h.total_answers > 0 ? (h.correct_answers / h.total_answers) * 100 : 0;
        }
      });

      // Average scores by specialty
      Object.keys(bySpecialty).forEach(spec => {
        bySpecialty[spec].score = Math.round(bySpecialty[spec].score / bySpecialty[spec].completed);
      });

      return {
        totalCasesStarted: history.length,
        totalCasesCompleted: completed.length,
        averageScore: scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0,
        bySpecialty,
        recentCases: completed.slice(-5).map((h: any) => ({
          caseId: h.case_id,
          title: SAMPLE_CASES.find(c => c.id === h.case_id)?.title || 'Cas inconnu',
          score: h.total_answers > 0 ? Math.round((h.correct_answers / h.total_answers) * 100) : 0,
          date: h.completed_at || h.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching clinical stats:', error);
      return {
        totalCasesStarted: 0, totalCasesCompleted: 0, averageScore: 0, bySpecialty: {}, recentCases: []
      };
    }
  }, []);

  // Export case history
  const exportHistory = useCallback(async (userId: string): Promise<string> => {
    const { data: history } = await (supabase as any)
      .from('clinical_cases_history')
      .select('*')
      .eq('user_id', userId);

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      userId,
      totalCases: history?.length || 0,
      history: history || []
    }, null, 2);
  }, []);

  // Clear user history
  const clearHistory = useCallback(async (userId: string) => {
    await (supabase as any)
      .from('clinical_cases_history')
      .delete()
      .eq('user_id', userId);
  }, []);

  // Check if case was completed by user
  const wasCaseCompleted = useCallback(async (userId: string, caseId: string): Promise<boolean> => {
    const { data } = await (supabase as any)
      .from('clinical_cases_history')
      .select('id')
      .eq('user_id', userId)
      .eq('case_id', caseId)
      .not('completed_at', 'is', null)
      .limit(1);
    return (data?.length || 0) > 0;
  }, []);

  // Get best score for a case
  const getBestScore = useCallback(async (userId: string, caseId: string): Promise<number> => {
    const { data: history } = await (supabase as any)
      .from('clinical_cases_history')
      .select('score')
      .eq('user_id', userId)
      .eq('case_id', caseId)
      .not('completed_at', 'is', null);

    if (!history || history.length === 0) return 0;
    return Math.max(...history.map((h: any) => h.score || 0));
  }, []);

  return {
    getStats,
    exportHistory,
    clearHistory,
    wasCaseCompleted,
    getBestScore,
  };
};
