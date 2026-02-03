import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Préférences d'accessibilité avancées
 */
export interface AccessibilityPreferences {
  // Police
  fontFamily: 'default' | 'dyslexia' | 'serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  
  // Audio
  audioSpeed: number; // 0.5 - 2.0
  autoPlayAudio: boolean;
  
  // Visuel
  highContrast: boolean;
  reduceMotion: boolean;
  largeClickTargets: boolean;
  
  // QCM/Exercices
  defaultDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  showHints: boolean;
  extendedTime: boolean;
  
  // Lecture
  screenReaderOptimized: boolean;
  audioDescriptions: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontFamily: 'default',
  fontSize: 'medium',
  lineSpacing: 'normal',
  audioSpeed: 1.0,
  autoPlayAudio: false,
  highContrast: false,
  reduceMotion: false,
  largeClickTargets: false,
  defaultDifficulty: 'adaptive',
  showHints: true,
  extendedTime: false,
  screenReaderOptimized: false,
  audioDescriptions: false,
};

const FONT_FAMILIES: Record<AccessibilityPreferences['fontFamily'], string> = {
  default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  dyslexia: '"OpenDyslexic", "Comic Sans MS", sans-serif',
  serif: '"Georgia", "Times New Roman", Times, serif',
  mono: '"Fira Code", "Consolas", "Monaco", monospace',
};

const FONT_SIZES: Record<AccessibilityPreferences['fontSize'], string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
};

const LINE_HEIGHTS: Record<AccessibilityPreferences['lineSpacing'], string> = {
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
};

/**
 * Hook pour gérer les préférences d'accessibilité avancées
 */
export function useAccessibilityPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Clé de stockage unique par utilisateur
  const storageKey = user?.id ? `med-mng-a11y-${user.id}` : 'med-mng-a11y-anon';

  // Charger les préférences
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load accessibility preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Appliquer les styles CSS globaux
  useEffect(() => {
    const root = document.documentElement;
    
    // Police
    root.style.setProperty('--font-family-base', FONT_FAMILIES[preferences.fontFamily]);
    root.style.setProperty('--font-size-base', FONT_SIZES[preferences.fontSize]);
    root.style.setProperty('--line-height-base', LINE_HEIGHTS[preferences.lineSpacing]);
    
    // Classes CSS pour fonctionnalités avancées
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('reduce-motion', preferences.reduceMotion);
    root.classList.toggle('large-targets', preferences.largeClickTargets);
    root.classList.toggle('dyslexia-font', preferences.fontFamily === 'dyslexia');
    root.classList.toggle('screen-reader-optimized', preferences.screenReaderOptimized);

    // Préférence système pour reduced motion
    if (preferences.reduceMotion) {
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.removeProperty('--transition-duration');
    }

    return () => {
      root.classList.remove('high-contrast', 'reduce-motion', 'large-targets', 'dyslexia-font', 'screen-reader-optimized');
    };
  }, [preferences]);

  // Sauvegarder les préférences
  const savePreferences = useCallback((newPrefs: AccessibilityPreferences) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (err) {
      console.error('Failed to save accessibility preferences:', err);
    }
  }, [storageKey]);

  // Mettre à jour une préférence spécifique
  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
  }, [preferences, savePreferences]);

  // Réinitialiser
  const resetToDefaults = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  // Exporter les préférences
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  // Importer les préférences
  const importPreferences = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      const validated = { ...DEFAULT_PREFERENCES, ...parsed };
      savePreferences(validated);
      return true;
    } catch {
      return false;
    }
  }, [savePreferences]);

  return {
    preferences,
    isLoading,
    updatePreference,
    savePreferences,
    resetToDefaults,
    exportPreferences,
    importPreferences,
    // Constantes utilitaires
    fontFamilies: Object.keys(FONT_FAMILIES) as AccessibilityPreferences['fontFamily'][],
    fontSizes: Object.keys(FONT_SIZES) as AccessibilityPreferences['fontSize'][],
    lineSpacings: Object.keys(LINE_HEIGHTS) as AccessibilityPreferences['lineSpacing'][],
    difficulties: ['easy', 'medium', 'hard', 'adaptive'] as AccessibilityPreferences['defaultDifficulty'][],
  };
}

export default useAccessibilityPreferences;
