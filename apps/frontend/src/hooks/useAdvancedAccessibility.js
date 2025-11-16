import { useState, useEffect, useCallback } from 'react';

export const useAdvancedAccessibility = () => {
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    highContrast: false,
    reducedMotion: false,
    screenReaderMode: false,
    focusIndicators: true,
    keyboardNavigation: true,
    announcements: true,
    textSpacing: 'normal',
    colorFilters: 'none'
  });

  const [keyboardMap, setKeyboardMap] = useState(new Map());

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    localStorage.setItem('advanced-accessibility-settings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);

  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    if (!settings.announcements) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [settings.announcements]);

  const setupKeyboardNavigation = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, index) => {
      keyboardMap.set(element, {
        index,
        next: focusableElements[index + 1] || focusableElements[0],
        previous: focusableElements[index - 1] || focusableElements[focusableElements.length - 1]
      });
    });

    setKeyboardMap(new Map(keyboardMap));
  }, [keyboardMap]);

  const handleKeyboardShortcut = useCallback((event) => {
    if (!settings.keyboardNavigation) return;

    // Tab navigation améliorée
    if (event.key === 'Tab') {
      const activeElement = document.activeElement;
      const elementInfo = keyboardMap.get(activeElement);
      
      if (elementInfo) {
        event.preventDefault();
        const target = event.shiftKey ? elementInfo.previous : elementInfo.next;
        if (target) {
          target.focus();
          announceToScreenReader(`Navigation vers: ${target.textContent || target.getAttribute('aria-label') || 'élément'}`);
        }
      }
    }

    // Escape pour fermer les modales/menus
    if (event.key === 'Escape') {
      const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
      if (activeModal) {
        const closeButton = activeModal.querySelector('[aria-label*="fermer"], [aria-label*="close"]');
        if (closeButton) {
          closeButton.click();
          announceToScreenReader('Modal fermée');
        }
      }
    }
  }, [settings.keyboardNavigation, keyboardMap, announceToScreenReader]);

  const applyAccessibilityStyles = useCallback(() => {
    const root = document.documentElement;
    
    // Taille de police
    switch (settings.fontSize) {
      case 'large':
        root.style.fontSize = '120%';
        break;
      case 'extra-large':
        root.style.fontSize = '150%';
        break;
      default:
        root.style.fontSize = '100%';
    }

    // Espacement du texte
    if (settings.textSpacing === 'wide') {
      root.style.letterSpacing = '0.1em';
      root.style.lineHeight = '1.8';
    } else {
      root.style.letterSpacing = 'normal';
      root.style.lineHeight = '1.6';
    }

    // Contraste élevé
    root.classList.toggle('high-contrast', settings.highContrast);
    
    // Mouvement réduit
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Indicateurs de focus
    root.classList.toggle('focus-indicators', settings.focusIndicators);

    // Filtres de couleur
    if (settings.colorFilters !== 'none') {
      root.classList.add(`color-filter-${settings.colorFilters}`);
    } else {
      root.className = root.className.replace(/color-filter-\w+/g, '');
    }
  }, [settings]);

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const saved = localStorage.getItem('advanced-accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load advanced accessibility settings');
      }
    }
  }, []);

  useEffect(() => {
    applyAccessibilityStyles();
    setupKeyboardNavigation();
    
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [applyAccessibilityStyles, setupKeyboardNavigation, handleKeyboardShortcut]);

  return {
    settings,
    updateSettings,
    announceToScreenReader,
    setupKeyboardNavigation,
    applyAccessibilityStyles
  };
};