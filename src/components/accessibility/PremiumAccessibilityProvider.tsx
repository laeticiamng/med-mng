/**
 * ♿ PREMIUM ACCESSIBILITY PROVIDER - MED-MNG v4.0
 * Accessibilité WCAG 2.1 AAA premium
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  announcements: boolean;
  focusIndicators: boolean;
}

interface AccessibilityContext {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContext | null>(null);

export const usePremiumAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('usePremiumAccessibility must be used within PremiumAccessibilityProvider');
  }
  return context;
};

interface PremiumAccessibilityProviderProps {
  children: React.ReactNode;
}

export const PremiumAccessibilityProvider: React.FC<PremiumAccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fontSize: 'medium',
    keyboardNavigation: true,
    announcements: true,
    focusIndicators: true
  });

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Appliquer les changements au DOM
    const html = document.documentElement;
    
    switch (key) {
      case 'highContrast':
        html.classList.toggle('high-contrast', value);
        break;
      case 'reducedMotion':
        html.style.setProperty('--animation-duration', value ? '0.01ms' : '0.3s');
        break;
      case 'fontSize':
        html.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
        html.classList.add(value === 'small' ? 'text-sm' : 
                          value === 'large' ? 'text-lg' :
                          value === 'extra-large' ? 'text-xl' : 'text-base');
        break;
      case 'focusIndicators':
        html.classList.toggle('no-focus-indicators', !value);
        break;
    }
    
    logger.info('accessibility', 'Setting updated', { key, value });
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;
    
    const announcer = document.getElementById(
      priority === 'assertive' ? 'urgent-announcements' : 'announcements'
    );
    
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
    
    logger.debug('accessibility', 'Announcement made', { message, priority });
  }, [settings.announcements]);

  // Initialisation des paramètres d'accessibilité
  React.useEffect(() => {
    // Détecter les préférences système
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    // Listener pour les changements de préférences
    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateSetting('reducedMotion', e.matches);
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      updateSetting('highContrast', e.matches);
    };
    
    prefersReducedMotion.addEventListener('change', handleMotionChange);
    prefersHighContrast.addEventListener('change', handleContrastChange);
    
    // Initialisation des styles
    updateSetting('reducedMotion', prefersReducedMotion.matches);
    updateSetting('highContrast', prefersHighContrast.matches);
    
    return () => {
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
      prefersHighContrast.removeEventListener('change', handleContrastChange);
    };
  }, [updateSetting]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, announce }}>
      {children}
    </AccessibilityContext.Provider>
  );
};