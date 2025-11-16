import { useMemo } from 'react';

/**
 * Hook d'optimisation pour les transformations de tableaux
 * Utilise useMemo pour éviter les re-calculs inutiles
 */
export const useOptimizedTableau = (data: any, itemCode: string) => {
  const processedData = useMemo(() => {
    if (!data) return null;

    // Si sections existe, retourner tel quel (déjà optimisé)
    if (data.sections && Array.isArray(data.sections)) {
      return data;
    }

    // Sinon, retourner les données brutes
    return data;
  }, [data, itemCode]);

  return processedData;
};

/**
 * Hook pour compter les compétences de manière optimisée
 */
export const useCompetencesCount = (tableauA: any, tableauB: any) => {
  const counts = useMemo(() => {
    const countA = tableauA?.sections?.reduce((total: number, section: any) => {
      return total + (section.competences?.length || 0);
    }, 0) || 0;

    const countB = tableauB?.sections?.reduce((total: number, section: any) => {
      return total + (section.competences?.length || 0);
    }, 0) || 0;

    return {
      rangA: countA,
      rangB: countB,
      total: countA + countB
    };
  }, [tableauA, tableauB]);

  return counts;
};
