/**
 * Hook de validation pour le générateur musical
 * Centralise toutes les validations avant génération
 */

import { useSunoCredits } from '@/hooks/useSunoCredits';
import { useCallback, useMemo } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface LyricsData {
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  paroles_musicales?: string[];
}

interface UseGeneratorValidationOptions {
  contentType: string;
  selectedItem: string;
  selectedRang: string;
  selectedStyle: string;
  selectedSituation?: string;
  ednLyrics?: LyricsData | null;
  ecosLyrics?: { paroles?: string[] } | null;
  user?: { id: string } | null;
  remainingFree: number;
  canGenerateMusic: () => boolean;
}

export const useGeneratorValidation = ({
  contentType,
  selectedItem,
  selectedRang,
  selectedStyle,
  selectedSituation,
  ednLyrics,
  ecosLyrics,
  user,
  remainingFree,
  canGenerateMusic
}: UseGeneratorValidationOptions) => {
  const { _credits, hasNoCredits, hasLowCredits } = useSunoCredits();

  // Vérifier la disponibilité des paroles
  const lyricsAvailability = useMemo(() => {
    if (contentType === 'edn' && ednLyrics) {
      return {
        hasA: !!(ednLyrics.paroles_rang_a?.length || ednLyrics.paroles_musicales?.length),
        hasB: !!(ednLyrics.paroles_rang_b?.length || ednLyrics.paroles_musicales?.length),
        hasAB: !!(ednLyrics.paroles_rang_ab?.length || ednLyrics.paroles_musicales?.length),
        hasAny: !!(
          ednLyrics.paroles_rang_a?.length ||
          ednLyrics.paroles_rang_b?.length ||
          ednLyrics.paroles_rang_ab?.length ||
          ednLyrics.paroles_musicales?.length
        )
      };
    }
    if (contentType === 'ecos' && ecosLyrics) {
      return {
        hasA: !!(ecosLyrics.paroles?.length),
        hasB: false,
        hasAB: false,
        hasAny: !!(ecosLyrics.paroles?.length)
      };
    }
    return { hasA: false, hasB: false, hasAB: false, hasAny: false };
  }, [contentType, ednLyrics, ecosLyrics]);

  // Obtenir les paroles pour le rang sélectionné
  const getLyricsForRang = useCallback((): string[] => {
    if (contentType === 'edn' && ednLyrics) {
      if (selectedRang === 'A' && ednLyrics.paroles_rang_a?.length) {
        return ednLyrics.paroles_rang_a;
      }
      if (selectedRang === 'B' && ednLyrics.paroles_rang_b?.length) {
        return ednLyrics.paroles_rang_b;
      }
      if (selectedRang === 'AB' && ednLyrics.paroles_rang_ab?.length) {
        return ednLyrics.paroles_rang_ab;
      }
      // Fallback
      if (ednLyrics.paroles_musicales?.length) {
        return ednLyrics.paroles_musicales;
      }
    }
    if (contentType === 'ecos' && ecosLyrics?.paroles?.length) {
      return ecosLyrics.paroles;
    }
    return [];
  }, [contentType, selectedRang, ednLyrics, ecosLyrics]);

  // Valider les paroles
  const validateLyrics = useCallback((): { valid: boolean; error?: string; warning?: string } => {
    const lyrics = getLyricsForRang();
    const text = lyrics.join('\n');
    
    if (!text || text.trim() === '') {
      return { valid: false, error: 'Aucune parole disponible pour ce rang' };
    }
    
    if (text.length > 5000) {
      return { valid: false, error: 'Paroles trop longues (max 5000 caractères)' };
    }
    
    if (text.length > 3000) {
      return { valid: true, warning: 'Paroles longues, seront tronquées (max 3000 pour Suno)' };
    }
    
    if (text.length < 50) {
      return { valid: true, warning: 'Paroles très courtes, résultat peut être incomplet' };
    }
    
    return { valid: true };
  }, [getLyricsForRang]);

  // Validation complète avant génération
  const validate = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifications de base
    if (!contentType) {
      errors.push('Type de contenu non sélectionné');
    }

    if (contentType === 'edn' && !selectedItem) {
      errors.push('Item EDN non sélectionné');
    }

    if (contentType === 'ecos' && !selectedSituation) {
      errors.push('Situation ECOS non sélectionnée');
    }

    if (contentType === 'edn' && !selectedRang) {
      errors.push('Rang non sélectionné');
    }

    if (!selectedStyle) {
      errors.push('Style musical non sélectionné');
    }

    // Validation des paroles
    const lyricsValidation = validateLyrics();
    if (!lyricsValidation.valid && lyricsValidation.error) {
      errors.push(lyricsValidation.error);
    }
    if (lyricsValidation.warning) {
      warnings.push(lyricsValidation.warning);
    }

    // Vérification des quotas
    if (!user) {
      if (remainingFree <= 0) {
        errors.push('Plus de générations gratuites. Connectez-vous pour continuer.');
      } else if (remainingFree <= 2) {
        warnings.push(`${remainingFree} génération(s) gratuite(s) restante(s)`);
      }
    } else {
      if (!canGenerateMusic()) {
        errors.push('Quota de génération atteint pour ce mois');
      }
    }

    // Vérification des crédits Suno
    if (hasNoCredits) {
      errors.push('Aucun crédit Suno disponible');
    } else if (hasLowCredits) {
      warnings.push('Crédits Suno bientôt épuisés');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [
    contentType, 
    selectedItem, 
    selectedRang, 
    selectedStyle, 
    selectedSituation,
    user, 
    remainingFree, 
    canGenerateMusic,
    hasNoCredits,
    hasLowCredits,
    validateLyrics
  ]);

  // Vérifier si on peut générer (version simplifiée)
  const canGenerate = useMemo(() => {
    if (!contentType || !selectedStyle) return false;
    
    if (contentType === 'edn') {
      if (!selectedItem || !selectedRang) return false;
      const hasLyrics = (selectedRang === 'A' && lyricsAvailability.hasA) ||
                        (selectedRang === 'B' && lyricsAvailability.hasB) ||
                        (selectedRang === 'AB' && lyricsAvailability.hasAB);
      return hasLyrics;
    }
    
    if (contentType === 'ecos') {
      return !!selectedSituation && lyricsAvailability.hasA;
    }
    
    return false;
  }, [contentType, selectedItem, selectedRang, selectedStyle, selectedSituation, lyricsAvailability]);

  return {
    validate,
    canGenerate,
    lyricsAvailability,
    getLyricsForRang,
    validateLyrics,
    hasCreditsIssue: hasNoCredits || hasLowCredits,
    creditsWarning: hasLowCredits ? 'Crédits Suno bientôt épuisés' : hasNoCredits ? 'Aucun crédit Suno' : null
  };
};
