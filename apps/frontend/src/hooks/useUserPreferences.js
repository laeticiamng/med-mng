import { useState, useEffect, useCallback } from 'react';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'fr',
    notifications: {
      browser: true,
      email: true,
      sound: false,
      vibration: false
    },
    dashboard: {
      layout: 'grid',
      widgets: ['overview', 'charts', 'notifications'],
      refreshRate: 30
    },
    interface: {
      sidebarCollapsed: false,
      compactMode: false,
      animationsEnabled: true,
      tooltipsEnabled: true
    },
    privacy: {
      analytics: true,
      cookies: true,
      dataSharing: false
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('user-preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateNestedPreference = useCallback((category, key, value) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
      localStorage.setItem('user-preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    const defaultPrefs = {
      theme: 'system',
      language: 'fr',
      notifications: {
        browser: true,
        email: true,
        sound: false,
        vibration: false
      },
      dashboard: {
        layout: 'grid',
        widgets: ['overview', 'charts', 'notifications'],
        refreshRate: 30
      },
      interface: {
        sidebarCollapsed: false,
        compactMode: false,
        animationsEnabled: true,
        tooltipsEnabled: true
      },
      privacy: {
        analytics: true,
        cookies: true,
        dataSharing: false
      }
    };
    
    setPreferences(defaultPrefs);
    localStorage.setItem('user-preferences', JSON.stringify(defaultPrefs));
  }, []);

  const getPreference = useCallback((category, key) => {
    if (!category) return preferences;
    if (!key) return preferences[category];
    return preferences[category]?.[key];
  }, [preferences]);

  const exportPreferences = useCallback(() => {
    const data = {
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'med-mng-preferences.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [preferences]);

  const importPreferences = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          if (data.preferences) {
            setPreferences(data.preferences);
            localStorage.setItem('user-preferences', JSON.stringify(data.preferences));
            resolve(data.preferences);
          } else {
            reject(new Error('Format de fichier invalide'));
          }
        } catch (error) {
          reject(new Error('Erreur lors de la lecture du fichier'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file);
    });
  }, []);

  // Apply theme preference
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (preferences.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', preferences.theme === 'dark');
      }
    };

    applyTheme();
    
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [preferences.theme]);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = localStorage.getItem('user-preferences');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPreferences(parsed);
        }
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    updatePreferences,
    updateNestedPreference,
    resetPreferences,
    getPreference,
    exportPreferences,
    importPreferences
  };
};