import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/structuredLogger';

interface AccessibilityState {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  focusVisible: boolean;
  keyboardOnly: boolean;
}

interface AccessibilitySettings extends AccessibilityState {
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  voiceAnnouncements: boolean;
}

export const useOptimizedAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('accessibility-settings-v2');
      return saved ? JSON.parse(saved) : {
        screenReader: false,
        highContrast: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        fontSize: 'medium',
        focusVisible: true,
        keyboardOnly: false,
        colorBlindMode: 'none',
        voiceAnnouncements: true
      };
    } catch {
      return {
        screenReader: false,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        fontSize: 'medium' as const,
        focusVisible: true,
        keyboardOnly: false,
        colorBlindMode: 'none' as const,
        voiceAnnouncements: true
      };
    }
  });

  const [isScreenReader, setIsScreenReader] = useState(false);
  const announceTimeoutRef = useRef<NodeJS.Timeout>();

  // Détection automatique des lecteurs d'écran
  useEffect(() => {
    const detectScreenReader = () => {
      const indicators = [
        navigator.userAgent.includes('NVDA'),
        navigator.userAgent.includes('JAWS'),
        navigator.userAgent.includes('VoiceOver'),
        document.querySelector('[aria-live]') !== null,
        window.speechSynthesis !== undefined
      ];
      
      const detected = indicators.some(Boolean);
      setIsScreenReader(detected);
      
      if (detected) {
        logger.info('Lecteur d\'écran détecté', { 
          component: 'Accessibility',
          metadata: { userAgent: navigator.userAgent }
        });
      }
    };

    detectScreenReader();
  }, []);

  // Application des paramètres d'accessibilité
  useEffect(() => {
    const documentElement = document.documentElement;
    const body = document.body;

    // High contrast
    if (settings.highContrast) {
      documentElement.classList.add('accessibility-high-contrast');
      body.style.setProperty('--accessibility-contrast', 'high');
    } else {
      documentElement.classList.remove('accessibility-high-contrast');
      body.style.removeProperty('--accessibility-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      documentElement.classList.add('accessibility-reduced-motion');
      body.style.setProperty('--animation-duration', '0.01ms');
      body.style.setProperty('--transition-duration', '0.01ms');
    } else {
      documentElement.classList.remove('accessibility-reduced-motion');
      body.style.removeProperty('--animation-duration');
      body.style.removeProperty('--transition-duration');
    }

    // Font size
    const fontSizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      xlarge: '1.25rem'
    };
    body.style.setProperty('--accessibility-font-size', fontSizes[settings.fontSize]);
    documentElement.setAttribute('data-font-size', settings.fontSize);

    // Focus visible
    if (settings.focusVisible) {
      documentElement.classList.add('accessibility-focus-visible');
    } else {
      documentElement.classList.remove('accessibility-focus-visible');
    }

    // Color blind mode
    if (settings.colorBlindMode !== 'none') {
      documentElement.classList.add(`accessibility-colorblind-${settings.colorBlindMode}`);
    } else {
      documentElement.classList.remove(
        'accessibility-colorblind-protanopia',
        'accessibility-colorblind-deuteranopia', 
        'accessibility-colorblind-tritanopia'
      );
    }

    // Sauvegarde
    try {
      localStorage.setItem('accessibility-settings-v2', JSON.stringify(settings));
    } catch (error) {
      logger.error('Échec sauvegarde paramètres accessibilité', 
        { component: 'Accessibility' }, error as Error);
    }

  }, [settings]);

  // Gestion du clavier seul
  useEffect(() => {
    let keyboardUsed = false;
    let mouseUsed = false;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        keyboardUsed = true;
        if (!mouseUsed && !settings.keyboardOnly) {
          setSettings(prev => ({ ...prev, keyboardOnly: true }));
          logger.info('Navigation clavier détectée', { component: 'Accessibility' });
        }
      }
    };

    const handleMousedown = () => {
      mouseUsed = true;
      if (settings.keyboardOnly && keyboardUsed) {
        setSettings(prev => ({ ...prev, keyboardOnly: false }));
      }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, [settings.keyboardOnly]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    logger.info(`Paramètre accessibilité modifié: ${key}`, {
      component: 'Accessibility',
      metadata: { key, value }
    });
  }, []);

  const announceToScreenReader = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    delay: number = 100
  ) => {
    if (!settings.voiceAnnouncements) return;

    if (announceTimeoutRef.current) {
      clearTimeout(announceTimeoutRef.current);
    }

    announceTimeoutRef.current = setTimeout(() => {
      // Création d'un élément temporaire pour l'annonce
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';

      document.body.appendChild(announcer);
      
      // Annonce du message
      announcer.textContent = message;
      
      // Nettoyage après l'annonce
      setTimeout(() => {
        if (document.body.contains(announcer)) {
          document.body.removeChild(announcer);
        }
      }, 1000);

      logger.debug(`Annonce lecteur d'écran: ${message}`, {
        component: 'Accessibility',
        metadata: { priority, delay }
      });
    }, delay);
  }, [settings.voiceAnnouncements]);

  const resetSettings = useCallback(() => {
    const defaultSettings: AccessibilitySettings = {
      screenReader: isScreenReader,
      highContrast: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      fontSize: 'medium',
      focusVisible: true,
      keyboardOnly: false,
      colorBlindMode: 'none',
      voiceAnnouncements: true
    };
    
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings-v2');
    announceToScreenReader('Paramètres d\'accessibilité réinitialisés', 'assertive');
    
    logger.info('Paramètres accessibilité réinitialisés', { component: 'Accessibility' });
  }, [isScreenReader, announceToScreenReader]);

  const getAccessibilityScore = useCallback((): number => {
    let score = 0;
    const weights = {
      screenReader: 25,
      highContrast: 15,
      reducedMotion: 15,
      fontSize: 10,
      focusVisible: 20,
      keyboardOnly: 10,
      colorBlindMode: 5
    };

    if (isScreenReader || settings.screenReader) score += weights.screenReader;
    if (settings.highContrast) score += weights.highContrast;
    if (settings.reducedMotion) score += weights.reducedMotion;
    if (settings.fontSize !== 'medium') score += weights.fontSize;
    if (settings.focusVisible) score += weights.focusVisible;
    if (settings.keyboardOnly) score += weights.keyboardOnly;
    if (settings.colorBlindMode !== 'none') score += weights.colorBlindMode;

    return Math.min(100, score);
  }, [settings, isScreenReader]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (announceTimeoutRef.current) {
        clearTimeout(announceTimeoutRef.current);
      }
    };
  }, []);

  return {
    settings,
    isScreenReader,
    updateSetting,
    announceToScreenReader,
    resetSettings,
    getAccessibilityScore,
    
    // Helpers rapides
    isHighContrast: settings.highContrast,
    isReducedMotion: settings.reducedMotion,
    isKeyboardOnly: settings.keyboardOnly,
    currentFontSize: settings.fontSize,
    colorBlindMode: settings.colorBlindMode
  };
};