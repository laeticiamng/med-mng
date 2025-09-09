import { useEffect, useCallback, useState } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'auto' | 'light' | 'dark';
}

export const useAdvancedAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    focusVisible: false,
    keyboardNavigation: false,
    fontSize: 'medium',
    colorScheme: 'auto'
  });

  // Détecter les préférences système
  const detectSystemPreferences = useCallback(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setPreferences(prev => ({
      ...prev,
      reducedMotion,
      highContrast,
      colorScheme: darkMode ? 'dark' : 'light'
    }));

    // Appliquer les classes CSS appropriées
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, []);

  // Navigation clavier améliorée
  const setupKeyboardNavigation = useCallback(() => {
    let isKeyboardUser = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Détecter l'utilisation du clavier
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        isKeyboardUser = true;
        document.documentElement.classList.add('keyboard-navigation');
        setPreferences(prev => ({ ...prev, keyboardNavigation: true, focusVisible: true }));
      }

      // Raccourcis clavier globaux
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k': // Ctrl+K pour la recherche
            e.preventDefault();
            (document.querySelector('input[type="search"]') as HTMLInputElement)?.focus();
            break;
          case 'm': // Ctrl+M pour le menu principal
            e.preventDefault();
            (document.querySelector('[role="navigation"] button') as HTMLButtonElement)?.focus();
            break;
          case 'h': // Ctrl+H pour l'accueil
            e.preventDefault();
            window.location.href = '/';
            break;
        }
      }

      // Navigation par landmarks avec Alt+chiffre
      if (e.altKey && /[1-9]/.test(e.key)) {
        e.preventDefault();
        const landmarkIndex = parseInt(e.key) - 1;
        const landmarks = document.querySelectorAll('main, nav, header, footer, aside, [role="banner"], [role="navigation"], [role="main"], [role="complementary"]');
        if (landmarks[landmarkIndex]) {
          const element = landmarks[landmarkIndex] as HTMLElement;
          element.focus();
          announceToScreenReader(`Navigation vers ${element.tagName.toLowerCase()}`);
        }
      }
    };

    const handleMouseDown = () => {
      if (isKeyboardUser) {
        isKeyboardUser = false;
        document.documentElement.classList.remove('keyboard-navigation');
        setPreferences(prev => ({ ...prev, keyboardNavigation: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Annonces pour lecteurs d'écran
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Nettoyer après l'annonce
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management avancé
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Ajustement de la taille de police
  const adjustFontSize = useCallback((size: AccessibilityPreferences['fontSize']) => {
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };

    document.documentElement.style.fontSize = sizeMap[size];
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    // Sauvegarder la préférence
    localStorage.setItem('accessibility-font-size', size);
  }, []);

  // Mode haut contraste
  const toggleHighContrast = useCallback((enabled?: boolean) => {
    const isEnabled = enabled ?? !preferences.highContrast;
    
    document.documentElement.classList.toggle('high-contrast', isEnabled);
    setPreferences(prev => ({ ...prev, highContrast: isEnabled }));
    
    localStorage.setItem('accessibility-high-contrast', isEnabled.toString());
    announceToScreenReader(`Mode haut contraste ${isEnabled ? 'activé' : 'désactivé'}`);
  }, [preferences.highContrast, announceToScreenReader]);

  // Charger les préférences sauvegardées
  const loadSavedPreferences = useCallback(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as AccessibilityPreferences['fontSize'];
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';

    if (savedFontSize) {
      adjustFontSize(savedFontSize);
    }
    
    if (savedHighContrast) {
      toggleHighContrast(true);
    }
  }, [adjustFontSize, toggleHighContrast]);

  // Skip links pour la navigation
  const setupSkipLinks = useCallback(() => {
    const skipLinks = [
      { href: '#main-content', text: 'Aller au contenu principal' },
      { href: '#navigation', text: 'Aller à la navigation' },
      { href: '#footer', text: 'Aller au pied de page' }
    ];

    const skipNav = document.createElement('nav');
    skipNav.className = 'skip-links fixed top-0 left-0 z-50 p-2 bg-primary text-primary-foreground transform -translate-y-full focus-within:translate-y-0 transition-transform';
    skipNav.setAttribute('aria-label', 'Liens de navigation rapide');

    skipLinks.forEach(link => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      a.className = 'block p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent';
      skipNav.appendChild(a);
    });

    document.body.insertBefore(skipNav, document.body.firstChild);
  }, []);

  useEffect(() => {
    detectSystemPreferences();
    loadSavedPreferences();
    setupSkipLinks();
    
    const cleanupKeyboard = setupKeyboardNavigation();
    
    // Écouter les changements de préférences système
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    motionMediaQuery.addEventListener('change', detectSystemPreferences);
    contrastMediaQuery.addEventListener('change', detectSystemPreferences);
    colorSchemeMediaQuery.addEventListener('change', detectSystemPreferences);

    return () => {
      cleanupKeyboard();
      motionMediaQuery.removeEventListener('change', detectSystemPreferences);
      contrastMediaQuery.removeEventListener('change', detectSystemPreferences);
      colorSchemeMediaQuery.removeEventListener('change', detectSystemPreferences);
    };
  }, [detectSystemPreferences, loadSavedPreferences, setupKeyboardNavigation, setupSkipLinks]);

  return {
    preferences,
    adjustFontSize,
    toggleHighContrast,
    announceToScreenReader,
    trapFocus
  };
};