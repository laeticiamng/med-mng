import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  mode: 'medical' | 'educational' | 'premium' | 'admin' | 'default';
}

interface PageThemeContextType {
  theme: PageTheme;
  setTheme: (theme: Partial<PageTheme>) => void;
  resetTheme: () => void;
  applyPageTheme: (path: string) => void;
}

const defaultTheme: PageTheme = {
  primary: 'hsl(221.2 83.2% 53.3%)',
  secondary: 'hsl(210 40% 95%)',
  accent: 'hsl(142.1 76.2% 36.3%)',
  background: 'hsl(0 0% 100%)',
  gradient: 'linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(142.1 76.2% 36.3%))',
  mode: 'default'
};

const pageThemes: Record<string, Partial<PageTheme>> = {
  '/med-mng': {
    primary: 'hsl(142.1 76.2% 36.3%)',
    accent: 'hsl(47.9 95.8% 53.1%)',
    gradient: 'linear-gradient(135deg, hsl(142.1 76.2% 36.3%), hsl(47.9 95.8% 53.1%))',
    mode: 'medical'
  },
  '/edn': {
    primary: 'hsl(221.2 83.2% 53.3%)',
    accent: 'hsl(262.1 83.3% 57.8%)',
    gradient: 'linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%))',
    mode: 'educational'
  },
  '/premium': {
    primary: 'hsl(47.9 95.8% 53.1%)',
    accent: 'hsl(24.6 95% 53.1%)',
    gradient: 'linear-gradient(135deg, hsl(47.9 95.8% 53.1%), hsl(24.6 95% 53.1%))',
    mode: 'premium'
  },
  '/admin': {
    primary: 'hsl(0 84.2% 60.2%)',
    accent: 'hsl(0 0% 20%)',
    gradient: 'linear-gradient(135deg, hsl(0 84.2% 60.2%), hsl(0 0% 20%))',
    mode: 'admin'
  }
};

const PageThemeContext = createContext<PageThemeContextType | undefined>(undefined);

export const usePageTheme = () => {
  const context = useContext(PageThemeContext);
  if (!context) {
    throw new Error('usePageTheme must be used within a PageThemeProvider');
  }
  return context;
};

interface PageThemeProviderProps {
  children: React.ReactNode;
}

export const PageThemeProvider: React.FC<PageThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<PageTheme>(defaultTheme);
  const location = useLocation();

  const applyThemeToCSSVariables = (newTheme: PageTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', newTheme.primary);
    root.style.setProperty('--secondary', newTheme.secondary);
    root.style.setProperty('--accent', newTheme.accent);
    root.style.setProperty('--background', newTheme.background);
    root.style.setProperty('--gradient-primary', newTheme.gradient);
    
    // Ajouter une classe pour le mode
    document.body.classList.remove('theme-medical', 'theme-educational', 'theme-premium', 'theme-admin', 'theme-default');
    document.body.classList.add(`theme-${newTheme.mode}`);
  };

  const setTheme = (newTheme: Partial<PageTheme>) => {
    const updatedTheme = { ...theme, ...newTheme };
    setThemeState(updatedTheme);
    applyThemeToCSSVariables(updatedTheme);
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
    applyThemeToCSSVariables(defaultTheme);
  };

  const applyPageTheme = (path: string) => {
    // Trouver le thème correspondant au chemin
    const matchingTheme = Object.keys(pageThemes).find(themePath => 
      path.startsWith(themePath)
    );
    
    if (matchingTheme) {
      const pageTheme = pageThemes[matchingTheme];
      setTheme(pageTheme);
    } else {
      resetTheme();
    }
  };

  // Appliquer automatiquement le thème selon la route
  useEffect(() => {
    applyPageTheme(location.pathname);
  }, [location.pathname]);

  // Appliquer le thème initial
  useEffect(() => {
    applyThemeToCSSVariables(theme);
  }, []);

  const contextValue: PageThemeContextType = {
    theme,
    setTheme,
    resetTheme,
    applyPageTheme
  };

  return (
    <PageThemeContext.Provider value={contextValue}>
      {children}
    </PageThemeContext.Provider>
  );
};