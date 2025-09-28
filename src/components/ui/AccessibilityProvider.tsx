import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  isFocusVisible: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  setHighContrast: (enabled: boolean) => void;
  setFocusVisible: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
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

  useEffect(() => {
    // Load preferences from localStorage
    const highContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const focusVisible = localStorage.getItem('accessibility-focus-visible') !== 'false';
    const motionReduced = localStorage.getItem('accessibility-reduced-motion') === 'true' || 
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' || 'medium';

    setIsHighContrast(highContrast);
    setIsFocusVisible(focusVisible);
    setReducedMotionState(motionReduced);
    setFontSize(savedFontSize);

    // Apply to document
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('focus-visible', focusVisible);
    document.documentElement.classList.toggle('reduced-motion', motionReduced);
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

  const value: AccessibilityContextType = {
    isHighContrast,
    isFocusVisible,
    reducedMotion,
    fontSize,
    setHighContrast,
    setFocusVisible,
    setReducedMotion,
    setFontSize: setFontSizeHandler
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};