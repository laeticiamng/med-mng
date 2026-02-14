import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ClinicalCase } from './types';
import { SAMPLE_CASES } from './sampleCases';

export const useClinicalCaseGeneration = () => {
  const [_loading, setLoading] = useState(false);
  const [cases, setCases] = useState<ClinicalCase[]>([]);

  // Get all available cases - load from Supabase, use built-in cases as backup only
  const getCases = useCallback(async (specialty?: string, difficulty?: string) => {
    setLoading(true);
    try {
      // Try to load from Supabase
      const { data: dbCases } = await (supabase as any)
        .from('ai_clinical_cases')
        .select('*');

      let allCases: ClinicalCase[] = [];

      if (dbCases && dbCases.length > 0) {
        allCases = dbCases.map((c: any) => ({
          id: c.id,
          title: c.title,
          specialty: c.specialty,
          difficulty: c.difficulty as ClinicalCase['difficulty'] || 'intermediate',
          description: c.description || '',
          patientPresentation: c.patient_presentation,
          steps: c.steps || [],
          relatedItems: c.related_items || [],
          estimatedTime: c.estimated_time || 15,
          learningObjectives: c.learning_objectives || []
        }));
      } else {
        // Use sample cases only if database is empty
        allCases = SAMPLE_CASES;
      }

      let filtered = [...allCases];
      if (specialty) {
        filtered = filtered.filter(c => c.specialty === specialty);
      }
      if (difficulty) {
        filtered = filtered.filter(c => c.difficulty === difficulty);
      }
      setCases(filtered);
      return filtered;
    } catch (e) {
      console.error('Error loading cases:', e);
      // Fallback to sample cases on error
      setCases(SAMPLE_CASES);
      return SAMPLE_CASES;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get case by ID
  const getCaseById = useCallback((caseId: string): ClinicalCase | undefined => {
    return cases.find(c => c.id === caseId);
  }, [cases]);

  // Get available specialties
  const getSpecialties = useCallback((): string[] => {
    return [...new Set(cases.map(c => c.specialty))];
  }, [cases]);

  // Get cases by specialty
  const getCasesBySpecialty = useCallback((specialty: string): ClinicalCase[] => {
    return cases.filter(c => c.specialty === specialty);
  }, [cases]);

  // Get cases by difficulty
  const getCasesByDifficulty = useCallback((difficulty: ClinicalCase['difficulty']): ClinicalCase[] => {
    return cases.filter(c => c.difficulty === difficulty);
  }, [cases]);

  // Get related items for a case
  const getRelatedItems = useCallback((caseId: string): string[] => {
    const clinicalCase = cases.find(c => c.id === caseId);
    return clinicalCase?.relatedItems || [];
  }, [cases]);

  // Search cases
  const searchCases = useCallback((query: string): ClinicalCase[] => {
    if (!query.trim()) return cases;
    const queryLower = query.toLowerCase();
    return cases.filter(c =>
      c.title.toLowerCase().includes(queryLower) ||
      c.description.toLowerCase().includes(queryLower) ||
      c.specialty.toLowerCase().includes(queryLower) ||
      c.learningObjectives.some(obj => obj.toLowerCase().includes(queryLower))
    );
  }, [cases]);

  // Get recommended cases based on user stats (synchronous version using default)
  const getRecommendedCases = useCallback((_userId: string): ClinicalCase[] => {
    // For sync use, recommend based on diversity of specialties
    const specialtyCounts = new Map<string, number>();
    cases.forEach(c => {
      specialtyCounts.set(c.specialty, (specialtyCounts.get(c.specialty) || 0) + 1);
    });

    return cases
      .sort((a, b) => {
        const countA = specialtyCounts.get(a.specialty) ?? 0;
        const countB = specialtyCounts.get(b.specialty) ?? 0;
        return countB - countA; // More diverse first
      })
      .slice(0, 5);
  }, [cases]);

  // Get case difficulty color (using semantic tokens)
  const getDifficultyColor = useCallback((difficulty: ClinicalCase['difficulty']): string => {
    switch (difficulty) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  }, []);

  // Get estimated time display
  const getEstimatedTimeDisplay = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }, []);

  // Get total cases count
  const getTotalCasesCount = useCallback((): number => {
    return cases.length;
  }, [cases]);

  return {
    _loading,
    cases,
    getCases,
    getCaseById,
    getSpecialties,
    getCasesBySpecialty,
    getCasesByDifficulty,
    getRelatedItems,
    searchCases,
    getRecommendedCases,
    getDifficultyColor,
    getEstimatedTimeDisplay,
    getTotalCasesCount,
  };
};
