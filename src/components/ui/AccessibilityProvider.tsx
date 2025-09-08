import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  isFocusVisible: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textSpacing: 'normal' | 'wide' | 'extra-wide';
  setHighContrast: (enabled: boolean) => void;
  setFocusVisible: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setColorBlindMode: (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => void;
  setTextSpacing: (spacing: 'normal' | 'wide' | 'extra-wide') => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(true);
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  const [textSpacing, setTextSpacing] = useState<'normal' | 'wide' | 'extra-wide'>('normal');

  useEffect(() => {
    // Load preferences from localStorage
    const highContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const focusVisible = localStorage.getItem('accessibility-focus-visible') !== 'false';
    const motionReduced = localStorage.getItem('accessibility-reduced-motion') === 'true' || 
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' || 'medium';
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader') === 'true';
    const savedKeyboardNav = localStorage.getItem('accessibility-keyboard-nav') === 'true';
    const savedColorBlind = localStorage.getItem('accessibility-color-blind') as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' || 'none';
    const savedTextSpacing = localStorage.getItem('accessibility-text-spacing') as 'normal' | 'wide' | 'extra-wide' || 'normal';

    setIsHighContrast(highContrast);
    setIsFocusVisible(focusVisible);
    setReducedMotionState(motionReduced);
    setFontSize(savedFontSize);
    setScreenReaderMode(savedScreenReader);
    setKeyboardNavigation(savedKeyboardNav);
    setColorBlindMode(savedColorBlind);
    setTextSpacing(savedTextSpacing);

    // Apply to document
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('focus-visible', focusVisible);
    document.documentElement.classList.toggle('reduced-motion', motionReduced);
    document.documentElement.classList.toggle('screen-reader-mode', savedScreenReader);
    document.documentElement.classList.toggle('keyboard-navigation', savedKeyboardNav);
    document.documentElement.classList.toggle(`color-blind-${savedColorBlind}`, savedColorBlind !== 'none');
    document.documentElement.classList.toggle(`text-spacing-${savedTextSpacing}`, savedTextSpacing !== 'normal');
    document.documentElement.setAttribute('data-font-size', savedFontSize);
  }, []);

  const setHighContrast = (enabled: boolean) => {
    setIsHighContrast(enabled);
    localStorage.setItem('accessibility-high-contrast', enabled.toString());
    document.documentElement.classList.toggle('high-contrast', enabled);
  };

  const setFocusVisible = (enabled: boolean) => {
    setIsFocusVisible(enabled);
    localStorage.setItem('accessibility-focus-visible', enabled.toString());
    document.documentElement.classList.toggle('focus-visible', enabled);
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    localStorage.setItem('accessibility-reduced-motion', enabled.toString());
    document.documentElement.classList.toggle('reduced-motion', enabled);
  };

  const setFontSizeHandler = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const setScreenReaderModeHandler = (enabled: boolean) => {
    setScreenReaderMode(enabled);
    localStorage.setItem('accessibility-screen-reader', enabled.toString());
    document.documentElement.classList.toggle('screen-reader-mode', enabled);
  };

  const setKeyboardNavigationHandler = (enabled: boolean) => {
    setKeyboardNavigation(enabled);
    localStorage.setItem('accessibility-keyboard-nav', enabled.toString());
    document.documentElement.classList.toggle('keyboard-navigation', enabled);
  };

  const setColorBlindModeHandler = (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    // Remove all existing color blind classes
    document.documentElement.classList.remove('color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
    
    setColorBlindMode(mode);
    localStorage.setItem('accessibility-color-blind', mode);
    
    if (mode !== 'none') {
      document.documentElement.classList.add(`color-blind-${mode}`);
    }
  };

  const setTextSpacingHandler = (spacing: 'normal' | 'wide' | 'extra-wide') => {
    // Remove all existing text spacing classes
    document.documentElement.classList.remove('text-spacing-wide', 'text-spacing-extra-wide');
    
    setTextSpacing(spacing);
    localStorage.setItem('accessibility-text-spacing', spacing);
    
    if (spacing !== 'normal') {
      document.documentElement.classList.add(`text-spacing-${spacing}`);
    }
  };

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  const value: AccessibilityContextType = {
    isHighContrast,
    isFocusVisible,
    reducedMotion,
    fontSize,
    screenReaderMode,
    keyboardNavigation,
    colorBlindMode,
    textSpacing,
    setHighContrast,
    setFocusVisible,
    setReducedMotion,
    setFontSize: setFontSizeHandler,
    setScreenReaderMode: setScreenReaderModeHandler,
    setKeyboardNavigation: setKeyboardNavigationHandler,
    setColorBlindMode: setColorBlindModeHandler,
    setTextSpacing: setTextSpacingHandler,
    announceToScreenReader
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};