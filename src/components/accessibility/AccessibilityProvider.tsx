import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  focusVisible: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') {
      return {
        highContrast: false,
        focusVisible: true,
        reducedMotion: false,
        fontSize: 'medium'
      };
    }
    try {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : {
        highContrast: false,
        focusVisible: true,
        reducedMotion: false,
        fontSize: 'medium'
      };
    } catch {
      return {
        highContrast: false,
        focusVisible: true,
        reducedMotion: false,
        fontSize: 'medium'
      };
    }
  });

  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Apply settings to HTML element
    const html = document.documentElement;
    
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    if (settings.focusVisible) {
      html.classList.add('focus-visible');
    } else {
      html.classList.remove('focus-visible');
    }

    if (settings.reducedMotion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }

    html.setAttribute('data-font-size', settings.fontSize);

    // Save to localStorage
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    } catch {
      // Ignore localStorage errors
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, announceToScreenReader }}>
      {children}
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};