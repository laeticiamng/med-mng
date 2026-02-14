import { useClinicalCaseGeneration } from '@/hooks/clinical/useClinicalCaseGeneration';
import { useClinicalCaseStats } from '@/hooks/clinical/useClinicalCaseStats';
import { useClinicalCaseReview } from '@/hooks/clinical/useClinicalCaseReview';

// Re-export all types so existing imports continue to work
export type { ClinicalStep, ClinicalCase, CaseProgress, ClinicalStats } from '@/hooks/clinical/types';

export const useClinicalCases = () => {
  const generation = useClinicalCaseGeneration();
  const stats = useClinicalCaseStats();
  const review = useClinicalCaseReview(generation.cases);

  return {
    // From useClinicalCaseGeneration
    _loading: generation._loading,
    cases: generation.cases,
    getCases: generation.getCases,
    getCaseById: generation.getCaseById,
    getSpecialties: generation.getSpecialties,
    getCasesBySpecialty: generation.getCasesBySpecialty,
    getCasesByDifficulty: generation.getCasesByDifficulty,
    getRelatedItems: generation.getRelatedItems,
    searchCases: generation.searchCases,
    getRecommendedCases: generation.getRecommendedCases,
    getDifficultyColor: generation.getDifficultyColor,
    getEstimatedTimeDisplay: generation.getEstimatedTimeDisplay,
    getTotalCasesCount: generation.getTotalCasesCount,

    // From useClinicalCaseReview
    currentProgress: review.currentProgress,
    startCase: review.startCase,
    submitDecision: review.submitDecision,
    completeCase: review.completeCase,
    getCurrentCase: review.getCurrentCase,
    getCurrentStep: review.getCurrentStep,
    getProgressPercentage: review.getProgressPercentage,
    getCurrentScore: review.getCurrentScore,
    isCaseCompleted: review.isCaseCompleted,
    resetProgress: review.resetProgress,
    getTimeSpent: review.getTimeSpent,
    getAverageTimePerStep: review.getAverageTimePerStep,

    // From useClinicalCaseStats
    getStats: stats.getStats,
    exportHistory: stats.exportHistory,
    clearHistory: stats.clearHistory,
    wasCaseCompleted: stats.wasCaseCompleted,
    getBestScore: stats.getBestScore,
  };
};
