/**
 * 🌟 ACCESSIBILITY PROVIDER - MED-MNG v3.0
 * Fournisseur d'accessibilité complet avec support WCAG 2.1 AA
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindnessFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReader: boolean;
  keyboardOnly: boolean;
  focusIndicators: 'default' | 'enhanced' | 'high-visibility';
  announcements: boolean;
  autoPlay: boolean;
  soundEffects: boolean;
}

export interface AccessibilityFeatures {
  skipLinks: boolean;
  landmarkNavigation: boolean;
  headingNavigation: boolean;
  focusTrap: boolean;
  ariaLive: boolean;
  keyboardShortcuts: boolean;
  voiceControl: boolean;
  gestureControl: boolean;
}

interface AccessibilityState {
  preferences: AccessibilityPreferences;
  features: AccessibilityFeatures;
  isScreenReaderActive: boolean;
  currentFocusPath: string[];
  announcements: string[];
  keyboardNavigation: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K, 
    value: AccessibilityPreferences[K]
  ) => void;
  toggleFeature: <K extends keyof AccessibilityFeatures>(
    key: K
  ) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusPath: (path: string[]) => void;
  enableKeyboardNavigation: () => void;
  disableKeyboardNavigation: () => void;
  getAccessibilityScore: () => number;
}

// ==========================================
// CONTEXT ET HOOK
// ==========================================

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// ==========================================
// PROVIDER COMPONENT
// ==========================================

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // État initial avec préférences système détectées
  const [state, setState] = useState<AccessibilityState>(() => {
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    const defaultPreferences: AccessibilityPreferences = {
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      fontSize: 'medium',
      colorBlindnessFilter: 'none',
      screenReader: false,
      keyboardOnly: false,
      focusIndicators: 'default',
      announcements: true,
      autoPlay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      soundEffects: true,
    };

    return {
      preferences: savedPreferences ? 
        { ...defaultPreferences, ...JSON.parse(savedPreferences) } : 
        defaultPreferences,
      features: {
        skipLinks: true,
        landmarkNavigation: true,
        headingNavigation: true,
        focusTrap: true,
        ariaLive: true,
        keyboardShortcuts: true,
        voiceControl: false,
        gestureControl: false,
      },
      isScreenReaderActive: false,
      currentFocusPath: [],
      announcements: [],
      keyboardNavigation: false,
    };
  });

  // ==========================================
  // DÉTECTION DES TECHNOLOGIES D'ASSISTANCE
  // ==========================================

  useEffect(() => {
    // Détecter si un lecteur d'écran est actif
    const detectScreenReader = () => {
      // Différentes méthodes de détection
      const hasScreenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis?.speaking ||
        document.querySelector('[aria-live]') !== null;

      setState(prev => ({
        ...prev,
        isScreenReaderActive: hasScreenReader,
        preferences: {
          ...prev.preferences,
          screenReader: hasScreenReader
        }
      }));

      if (hasScreenReader) {
        logger.info('accessibility', '🔊 Screen reader detected');
      }
    };

    // Détecter la navigation clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setState(prev => ({ ...prev, keyboardNavigation: true }));
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, keyboardNavigation: false }));
      document.body.classList.remove('keyboard-navigation');
    };

    detectScreenReader();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // ==========================================
  // GESTION DES PRÉFÉRENCES
  // ==========================================

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K, 
    value: AccessibilityPreferences[K]
  ) => {
    setState(prev => {
      const newPreferences = { ...prev.preferences, [key]: value };
      localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
      
      return {
        ...prev,
        preferences: newPreferences
      };
    });

    logger.info('accessibility', `Preference updated: ${key} = ${value}`);
  }, []);

  const toggleFeature = useCallback(<K extends keyof AccessibilityFeatures>(key: K) => {
    setState(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: !prev.features[key]
      }
    }));
  }, []);

  // ==========================================
  // ANNONCES ARIA LIVE
  // ==========================================

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!state.preferences.announcements) return;

    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message] // Garder les 5 dernières
    }));

    // Créer une région aria-live temporaire
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Nettoyer après annonce
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);

    logger.info('accessibility', `Announced: ${message}`);
  }, [state.preferences.announcements]);

  // ==========================================
  // NAVIGATION ET FOCUS
  // ==========================================

  const setFocusPath = useCallback((path: string[]) => {
    setState(prev => ({ ...prev, currentFocusPath: path }));
  }, []);

  const enableKeyboardNavigation = useCallback(() => {
    setState(prev => ({ ...prev, keyboardNavigation: true }));
    document.body.classList.add('keyboard-navigation');
    announce('Navigation clavier activée');
  }, [announce]);

  const disableKeyboardNavigation = useCallback(() => {
    setState(prev => ({ ...prev, keyboardNavigation: false }));
    document.body.classList.remove('keyboard-navigation');
  }, []);

  // ==========================================
  // SCORE D'ACCESSIBILITÉ
  // ==========================================

  const getAccessibilityScore = useCallback((): number => {
    let score = 0;
    const maxScore = 100;

    // Features activées (40 points)
    const featuresWeight = 40;
    const activeFeatures = Object.values(state.features).filter(Boolean).length;
    const totalFeatures = Object.keys(state.features).length;
    score += (activeFeatures / totalFeatures) * featuresWeight;

    // Préférences optimisées (30 points)
    const preferencesWeight = 30;
    let preferencesScore = 0;
    
    if (state.preferences.highContrast) preferencesScore += 5;
    if (state.preferences.reducedMotion) preferencesScore += 5;
    if (state.preferences.fontSize !== 'medium') preferencesScore += 5;
    if (state.preferences.focusIndicators !== 'default') preferencesScore += 5;
    if (state.preferences.announcements) preferencesScore += 10;
    
    score += Math.min(preferencesScore, preferencesWeight);

    // Technologies d'assistance (30 points)
    const assistiveWeight = 30;
    if (state.isScreenReaderActive) score += 15;
    if (state.keyboardNavigation) score += 10;
    if (state.announcements.length > 0) score += 5;

    return Math.round(score);
  }, [state]);

  // ==========================================
  // EFFETS DE MISE À JOUR DU DOM
  // ==========================================

  useEffect(() => {
    const { preferences } = state;
    const root = document.documentElement;

    // Contraste élevé
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Mouvements réduits
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Taille de police
    root.setAttribute('data-font-size', preferences.fontSize);

    // Filtres daltonisme
    if (preferences.colorBlindnessFilter !== 'none') {
      root.classList.add(`filter-${preferences.colorBlindnessFilter}`);
    } else {
      root.className = root.className.replace(/filter-\w+/g, '');
    }

    // Indicateurs de focus
    root.setAttribute('data-focus-indicators', preferences.focusIndicators);

    logger.debug('accessibility', 'DOM updated with accessibility preferences', preferences);
  }, [state.preferences]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const contextValue: AccessibilityContextType = {
    ...state,
    updatePreference,
    toggleFeature,
    announce,
    setFocusPath,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
    getAccessibilityScore,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Région ARIA Live pour les annonces */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {state.announcements[state.announcements.length - 1]}
      </div>
      
      {/* Région ARIA Live urgente */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </AccessibilityContext.Provider>
  );
};