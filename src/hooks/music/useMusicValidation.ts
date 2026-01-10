/**
 * Hook de validation pour la génération musicale
 * Valide URLs, paroles, styles et configurations
 */

import { useCallback } from 'react';

// Limites Suno par modèle (selon documentation officielle)
const SUNO_LIMITS = {
  V4: { promptMax: 2000, styleMax: 200, titleMax: 80 },
  V4_5: { promptMax: 2800, styleMax: 200, titleMax: 80 },
  V4_5ALL: { promptMax: 2800, styleMax: 1000, titleMax: 100 },
  V4_5PLUS: { promptMax: 2800, styleMax: 1000, titleMax: 100 },
  V5: { promptMax: 3000, styleMax: 1000, titleMax: 100 }
};

type SunoModel = keyof typeof SUNO_LIMITS;

interface LyricsValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
  charCount: number;
  wordCount: number;
  isTruncated: boolean;
}

interface StyleValidation {
  isValid: boolean;
  error?: string;
  normalizedStyle: string;
}

export const useMusicValidation = () => {
  // Validation et normalisation d'URL audio
  const validateAndNormalizeAudioUrl = useCallback((audioUrl: string): string => {
    if (!audioUrl) {
      throw new Error('Aucune URL audio reçue de l\'API Suno');
    }

    // URL relative
    if (audioUrl.startsWith('/')) {
      return audioUrl;
    }

    // URL absolue valide
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }

    throw new Error(`URL audio invalide reçue: ${audioUrl}`);
  }, []);

  const isValidAudioUrl = useCallback((url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  }, []);

  // ✅ NOUVEAU: Validation des paroles
  const validateLyrics = useCallback((
    lyrics: string | string[], 
    model: SunoModel = 'V4_5ALL'
  ): LyricsValidation => {
    const limits = SUNO_LIMITS[model] || SUNO_LIMITS.V4_5ALL;
    
    // Convertir en texte si tableau
    const text = Array.isArray(lyrics) ? lyrics.join('\n') : lyrics;
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    if (!text || text.trim() === '') {
      return {
        isValid: false,
        error: 'Les paroles sont vides',
        charCount: 0,
        wordCount: 0,
        isTruncated: false
      };
    }
    
    if (charCount < 20) {
      return {
        isValid: false,
        error: 'Les paroles sont trop courtes (minimum 20 caractères)',
        charCount,
        wordCount,
        isTruncated: false
      };
    }
    
    const isTruncated = charCount > limits.promptMax;
    
    if (charCount > limits.promptMax) {
      return {
        isValid: true,
        warning: `Paroles tronquées à ${limits.promptMax} caractères (limite ${model})`,
        charCount,
        wordCount,
        isTruncated: true
      };
    }
    
    if (charCount > limits.promptMax * 0.9) {
      return {
        isValid: true,
        warning: `Paroles proches de la limite (${charCount}/${limits.promptMax})`,
        charCount,
        wordCount,
        isTruncated: false
      };
    }
    
    return {
      isValid: true,
      charCount,
      wordCount,
      isTruncated: false
    };
  }, []);

  // ✅ NOUVEAU: Validation du style
  const validateStyle = useCallback((
    style: string, 
    model: SunoModel = 'V4_5ALL'
  ): StyleValidation => {
    const limits = SUNO_LIMITS[model] || SUNO_LIMITS.V4_5ALL;
    
    if (!style || style.trim() === '') {
      return {
        isValid: false,
        error: 'Le style musical est requis',
        normalizedStyle: ''
      };
    }
    
    // Normaliser le style
    let normalizedStyle = style.trim();
    
    // Tronquer si nécessaire
    if (normalizedStyle.length > limits.styleMax) {
      normalizedStyle = normalizedStyle.substring(0, limits.styleMax - 3) + '...';
    }
    
    return {
      isValid: true,
      normalizedStyle
    };
  }, []);

  // ✅ NOUVEAU: Validation du titre
  const validateTitle = useCallback((
    title: string, 
    model: SunoModel = 'V4_5ALL'
  ): { isValid: boolean; normalizedTitle: string; warning?: string } => {
    const limits = SUNO_LIMITS[model] || SUNO_LIMITS.V4_5ALL;
    
    if (!title || title.trim() === '') {
      return {
        isValid: true, // Titre optionnel, sera auto-généré
        normalizedTitle: ''
      };
    }
    
    let normalizedTitle = title.trim();
    let warning: string | undefined;
    
    if (normalizedTitle.length > limits.titleMax) {
      normalizedTitle = normalizedTitle.substring(0, limits.titleMax - 3) + '...';
      warning = `Titre tronqué à ${limits.titleMax} caractères`;
    }
    
    return {
      isValid: true,
      normalizedTitle,
      warning
    };
  }, []);

  // ✅ NOUVEAU: Validation complète avant génération
  const validateGeneration = useCallback((config: {
    lyrics: string | string[];
    style: string;
    title?: string;
    model?: SunoModel;
  }): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const model = config.model || 'V4_5ALL';
    
    const lyricsValidation = validateLyrics(config.lyrics, model);
    if (!lyricsValidation.isValid && lyricsValidation.error) {
      errors.push(lyricsValidation.error);
    }
    if (lyricsValidation.warning) {
      warnings.push(lyricsValidation.warning);
    }
    
    const styleValidation = validateStyle(config.style, model);
    if (!styleValidation.isValid && styleValidation.error) {
      errors.push(styleValidation.error);
    }
    
    if (config.title) {
      const titleValidation = validateTitle(config.title, model);
      if (titleValidation.warning) {
        warnings.push(titleValidation.warning);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [validateLyrics, validateStyle, validateTitle]);

  return {
    validateAndNormalizeAudioUrl,
    isValidAudioUrl,
    validateLyrics,
    validateStyle,
    validateTitle,
    validateGeneration,
    SUNO_LIMITS
  };
};
