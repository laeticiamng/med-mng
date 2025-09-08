/**
 * ⌨️ PREMIUM KEYBOARD PROVIDER - MED-MNG v4.0
 * Gestion avancée des raccourcis clavier
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremiumAccessibility } from '@/components/accessibility/PremiumAccessibilityProvider';
import { useFinalStore } from '@/stores/finalStore';
import { logger } from '@/lib/logger';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
  disabled?: boolean;
}

interface KeyboardContext {
  shortcuts: KeyboardShortcut[];
  addShortcut: (shortcut: KeyboardShortcut) => void;
  removeShortcut: (key: string) => void;
  getShortcutsByCategory: (category: string) => KeyboardShortcut[];
}

const KeyboardContext = createContext<KeyboardContext | null>(null);

export const usePremiumKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('usePremiumKeyboard must be used within PremiumKeyboardProvider');
  }
  return context;
};

interface PremiumKeyboardProviderProps {
  children: React.ReactNode;
}

export const PremiumKeyboardProvider: React.FC<PremiumKeyboardProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { announce } = usePremiumAccessibility();
  const { toggleSidebar } = useFinalStore();
  const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>([]);

  // Raccourcis par défaut premium
  const defaultShortcuts: KeyboardShortcut[] = React.useMemo(() => [
    // Navigation
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Aller à l\'accueil',
      category: 'Navigation'
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/patients'),
      description: 'Aller aux patients',
      category: 'Navigation'
    },
    {
      key: 'c',
      ctrlKey: true,
      action: () => navigate('/consultations'),
      description: 'Aller aux consultations',
      category: 'Navigation'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => navigate('/edn'),
      description: 'Aller aux items EDN',
      category: 'Navigation'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => navigate('/calendar'),
      description: 'Ouvrir le calendrier',
      category: 'Navigation'
    },
    
    // Interface
    {
      key: 'b',
      ctrlKey: true,
      action: () => {
        toggleSidebar();
        announce('Sidebar basculée');
      },
      description: 'Basculer la sidebar',
      category: 'Interface'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Ouvrir la palette de commandes (à implémenter)
        announce('Palette de commandes ouverte');
      },
      description: 'Ouvrir la palette de commandes',
      category: 'Interface'
    },
    
    // Accessibilité
    {
      key: '1',
      altKey: true,
      action: () => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          announce('Navigation vers le contenu principal');
        }
      },
      description: 'Aller au contenu principal',
      category: 'Accessibilité'
    },
    {
      key: '2',
      altKey: true,
      action: () => {
        const sidebar = document.getElementById('sidebar-navigation');
        if (sidebar) {
          const firstLink = sidebar.querySelector('a');
          firstLink?.focus();
          announce('Navigation vers le menu principal');
        }
      },
      description: 'Aller à la navigation',
      category: 'Accessibilité'
    },
    
    // Aide
    {
      key: '?',
      ctrlKey: true,
      action: () => {
        // Afficher l'aide des raccourcis
        announce('Aide des raccourcis clavier affichée');
      },
      description: 'Afficher l\'aide',
      category: 'Aide'
    }
  ], [navigate, announce, toggleSidebar]);

  // Initialiser avec les raccourcis par défaut
  React.useEffect(() => {
    setShortcuts(defaultShortcuts);
  }, [defaultShortcuts]);

  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev, shortcut]);
    logger.debug('keyboard', 'Shortcut added', { shortcut: shortcut.description });
  }, []);

  const removeShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
    logger.debug('keyboard', 'Shortcut removed', { key });
  }, []);

  const getShortcutsByCategory = useCallback((category: string) => {
    return shortcuts.filter(s => s.category === category);
  }, [shortcuts]);

  // Gestionnaire d'événements clavier
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorer si on est dans un champ de saisie
    const target = event.target as HTMLElement;
    const isInputField = target.matches('input, textarea, select, [contenteditable]');
    
    if (isInputField && !event.ctrlKey && !event.metaKey) {
      return;
    }

    // Chercher le raccourci correspondant
    for (const shortcut of shortcuts) {
      if (shortcut.disabled) continue;

      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = Boolean(shortcut.ctrlKey) === (event.ctrlKey || event.metaKey);
      const altMatch = Boolean(shortcut.altKey) === event.altKey;
      const shiftMatch = Boolean(shortcut.shiftKey) === event.shiftKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault();
        event.stopPropagation();
        
        try {
          shortcut.action();
          logger.debug('keyboard', 'Shortcut executed', { 
            key: shortcut.key, 
            description: shortcut.description 
          });
        } catch (error) {
          logger.error('keyboard', 'Shortcut execution failed', { error });
        }
        
        break;
      }
    }
  }, [shortcuts]);

  // Attacher/détacher les événements
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <KeyboardContext.Provider value={{
      shortcuts,
      addShortcut,
      removeShortcut,
      getShortcutsByCategory
    }}>
      {children}
    </KeyboardContext.Provider>
  );
};