import { useState, useEffect, useCallback } from 'react';

export type AccessibilityPreferences = {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusRing: boolean;
  keyboardNavigation: boolean;
};

const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderOptimized: false,
  colorBlindMode: 'none',
  focusRing: true,
  keyboardNavigation: true,
};

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isScreenReader, setIsScreenReader] = useState(false);

  // Detect system preferences on mount
  useEffect(() => {
    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-font-size: large)'),
    };

    // Check initial values
    setPreferences(prev => ({
      ...prev,
      reduceMotion: mediaQueries.reduceMotion.matches,
      highContrast: mediaQueries.highContrast.matches,
      largeText: mediaQueries.largeText.matches,
    }));

    // Detect screen reader
    const detectScreenReader = () => {
      const screenReaderIndicators = [
        'NVDA',
        'JAWS',
        'WindowEyes',
        'VoiceOver',
        'TalkBack',
      ];
      
      const userAgent = navigator.userAgent;
      const hasScreenReader = screenReaderIndicators.some(sr => 
        userAgent.includes(sr) || window.speechSynthesis
      );
      
      setIsScreenReader(hasScreenReader);
    };

    detectScreenReader();

    // Listen for changes
    const handlers = Object.entries(mediaQueries).map(([key, query]) => {
      const handler = (e: MediaQueryListEvent) => {
        setPreferences(prev => ({
          ...prev,
          [key]: e.matches,
        }));
      };
      
      query.addEventListener('change', handler);
      return { query, handler };
    });

    // Load saved preferences
    const savedPrefs = localStorage.getItem('accessibility-preferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }

    return () => {
      handlers.forEach(({ query, handler }) => {
        query.removeEventListener('change', handler);
      });
    };
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    
    // Apply CSS classes to document
    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', preferences.highContrast);
    
    // Large text
    root.classList.toggle('large-text', preferences.largeText);
    
    // Reduce motion
    root.classList.toggle('reduce-motion', preferences.reduceMotion);
    
    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (preferences.colorBlindMode !== 'none') {
      root.classList.add(preferences.colorBlindMode);
    }
    
    // Focus ring
    root.classList.toggle('enhanced-focus', preferences.focusRing);
    
  }, [preferences]);

  const updatePreference = useCallback((key: keyof AccessibilityPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('accessibility-preferences');
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    preferences,
    isScreenReader,
    updatePreference,
    resetPreferences,
    announceToScreenReader,
  };
};