import { useState, useEffect, useCallback } from 'react';

/**
 * Advanced accessibility hook for enhanced user experience
 */
export const useAdvancedAccessibility = () => {
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    focusVisible: true,
    screenReader: false
  });

  const [isEnabled, setIsEnabled] = useState(false);

  // Detect user preferences
  const detectAccessibilityPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }));

    // Check if any accessibility features are active
    setIsEnabled(prefersReducedMotion || prefersHighContrast || settings.focusVisible);
  }, [settings.focusVisible]);

  // Apply accessibility settings
  const applyAccessibilitySettings = useCallback(() => {
    const html = document.documentElement;

    // High contrast mode
    html.classList.toggle('high-contrast', settings.highContrast);
    
    // Reduced motion
    html.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Focus visible
    html.classList.toggle('focus-visible', settings.focusVisible);
    
    // Font size
    html.setAttribute('data-font-size', settings.fontSize);
  }, [settings]);

  // Toggle functions
  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const setFontSize = useCallback((size) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  }, []);

  const toggleFocusVisible = useCallback(() => {
    setSettings(prev => ({ ...prev, focusVisible: !prev.focusVisible }));
  }, []);

  // Announce changes to screen readers
  const announceChange = useCallback((message) => {
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

  // Initialize and apply settings
  useEffect(() => {
    detectAccessibilityPreferences();
  }, [detectAccessibilityPreferences]);

  useEffect(() => {
    applyAccessibilitySettings();
  }, [applyAccessibilitySettings]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = (e) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
      announceChange(e.matches ? 'Reduced motion enabled' : 'Reduced motion disabled');
    };

    const handleHighContrastChange = (e) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
      announceChange(e.matches ? 'High contrast enabled' : 'High contrast disabled');
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, [announceChange]);

  return {
    settings,
    isEnabled,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleFocusVisible,
    announceChange
  };
};

export default useAdvancedAccessibility;