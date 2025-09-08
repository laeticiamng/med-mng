/**
 * ⌨️ KEYBOARD SHORTCUTS HOOK - MED-MNG v3.0
 * Hook avancé pour raccourcis clavier avec accessibilité
 */

import { useEffect, useCallback, useRef } from 'react';
import { appNavigate } from "@/lib/navigation";
import { toast } from '@/hooks/use-toast';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
  disabled?: boolean;
  preventDefault?: boolean;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutConfig[];
}

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export const useKeyboardShortcuts = (customShortcuts: ShortcutConfig[] = []) => {
  const shortcutsRef = useRef<ShortcutConfig[]>([]);
  const { announce, preferences } = useAccessibility();

  // Raccourcis par défaut avec catégories
  const defaultShortcuts: ShortcutConfig[] = [
    // Navigation principale
    {
      key: 'h',
      ctrlKey: true,
      action: () => appNavigate('/'),
      description: 'Aller à l\'accueil',
      category: 'Navigation'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => appNavigate('/edn'),
      description: 'Ouvrir EDN Explorer',
      category: 'Navigation'
    },
    {
      key: 'g',
      ctrlKey: true,
      action: () => appNavigate('/generator'),
      description: 'Ouvrir le générateur musical',
      category: 'Navigation'
    },
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: () => appNavigate('/chat'),
      description: 'Ouvrir le Chat IA',
      category: 'Navigation'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: () => appNavigate('/med-mng/dashboard'),
      description: 'Ouvrir MED-MNG Dashboard',
      category: 'Navigation'
    },
    
    // Raccourcis d'accessibilité
    {
      key: '/',
      ctrlKey: true,
      action: () => showShortcutsHelp(),
      description: 'Afficher l\'aide des raccourcis clavier',
      category: 'Accessibilité'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => openCommandPalette(),
      description: 'Ouvrir la palette de commandes',
      category: 'Accessibilité'
    },
    {
      key: '1',
      altKey: true,
      action: () => skipToSection('#main-content', 'contenu principal'),
      description: 'Aller au contenu principal',
      category: 'Accessibilité'
    },
    {
      key: '2',
      altKey: true,
      action: () => skipToSection('#main-navigation', 'navigation principale'),
      description: 'Aller à la navigation',
      category: 'Accessibilité'
    },
    {
      key: '3',
      altKey: true,
      action: () => skipToSection('#search', 'recherche'),
      description: 'Aller à la recherche',
      category: 'Accessibilité'
    },
    
    // Raccourcis d'édition
    {
      key: 's',
      ctrlKey: true,
      action: () => handleSave(),
      description: 'Sauvegarder',
      category: 'Édition',
      preventDefault: true
    },
    {
      key: 'z',
      ctrlKey: true,
      action: () => handleUndo(),
      description: 'Annuler',
      category: 'Édition'
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => handleRedo(),
      description: 'Rétablir',
      category: 'Édition'
    },
    
    // Raccourcis de lecteur
    {
      key: ' ',
      action: () => handlePlayPause(),
      description: 'Lecture/Pause du lecteur audio',
      category: 'Lecteur',
      preventDefault: true
    },
    {
      key: 'ArrowRight',
      action: () => handleNextTrack(),
      description: 'Piste suivante',
      category: 'Lecteur'
    },
    {
      key: 'ArrowLeft',
      action: () => handlePreviousTrack(),
      description: 'Piste précédente',
      category: 'Lecteur'
    },
    
    // Raccourcis de focus
    {
      key: 'Tab',
      action: () => handleTabNavigation(),
      description: 'Navigation entre éléments',
      category: 'Focus',
      preventDefault: false
    },
    {
      key: 'Escape',
      action: () => handleEscape(),
      description: 'Fermer modal/menu ou retour',
      category: 'Focus'
    }
  ];

  // Combiner les raccourcis par défaut et personnalisés
  shortcutsRef.current = [...defaultShortcuts, ...customShortcuts];

  // ==========================================
  // ACTIONS DES RACCOURCIS
  // ==========================================

  const showShortcutsHelp = useCallback(() => {
    const categories = groupShortcutsByCategory(shortcutsRef.current);
    const helpContent = categories.map(category => 
      `${category.name}:\n${category.shortcuts.map(s => 
        `  ${formatShortcutKey(s)}: ${s.description}`
      ).join('\n')}`
    ).join('\n\n');
    
    toast({
      title: "Raccourcis clavier disponibles",
      description: helpContent,
      duration: 10000
    });

    announce('Aide des raccourcis clavier affichée');
  }, [announce]);

  const openCommandPalette = useCallback(() => {
    // Dispatch d'un événement personnalisé pour ouvrir la palette
    window.dispatchEvent(new CustomEvent('open-command-palette'));
    announce('Palette de commandes ouverte');
  }, [announce]);

  const skipToSection = useCallback((selector: string, sectionName: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce(`Navigation vers ${sectionName}`);
    } else {
      announce(`Section ${sectionName} non trouvée`);
    }
  }, [announce]);

  const handleSave = useCallback(() => {
    // Dispatch d'un événement de sauvegarde
    window.dispatchEvent(new CustomEvent('keyboard-save'));
    announce('Commande de sauvegarde envoyée');
  }, [announce]);

  const handleUndo = useCallback(() => {
    window.dispatchEvent(new CustomEvent('keyboard-undo'));
    announce('Annulation');
  }, [announce]);

  const handleRedo = useCallback(() => {
    window.dispatchEvent(new CustomEvent('keyboard-redo'));
    announce('Rétablissement');
  }, [announce]);

  const handlePlayPause = useCallback(() => {
    window.dispatchEvent(new CustomEvent('keyboard-play-pause'));
    announce('Lecture/Pause basculé');
  }, [announce]);

  const handleNextTrack = useCallback(() => {
    window.dispatchEvent(new CustomEvent('keyboard-next-track'));
    announce('Piste suivante');
  }, [announce]);

  const handlePreviousTrack = useCallback(() => {
    window.dispatchEvent(new CustomEvent('keyboard-previous-track'));
    announce('Piste précédente');
  }, [announce]);

  const handleTabNavigation = useCallback(() => {
    // Améliorer la visibilité de la navigation Tab
    document.body.classList.add('keyboard-navigation');
  }, []);

  const handleEscape = useCallback(() => {
    // Fermer les modales, menus, etc.
    window.dispatchEvent(new CustomEvent('keyboard-escape'));
  }, []);

  // ==========================================
  // UTILITAIRES
  // ==========================================

  const formatShortcutKey = useCallback((shortcut: ShortcutConfig): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey || shortcut.metaKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    // Traduction des touches spéciales
    const keyMap: Record<string, string> = {
      ' ': 'Espace',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Escape': 'Échap',
      'Enter': 'Entrée',
      'Tab': 'Tab'
    };
    
    const keyName = keyMap[shortcut.key] || shortcut.key.toUpperCase();
    parts.push(keyName);
    
    return parts.join('+');
  }, []);

  const groupShortcutsByCategory = useCallback((shortcuts: ShortcutConfig[]): ShortcutCategory[] => {
    const categoryMap = new Map<string, ShortcutConfig[]>();
    
    shortcuts.forEach(shortcut => {
      const category = shortcut.category || 'Général';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(shortcut);
    });
    
    return Array.from(categoryMap.entries()).map(([name, shortcuts]) => ({
      name,
      shortcuts
    }));
  }, []);

  // ==========================================
  // GESTIONNAIRE D'ÉVÉNEMENTS
  // ==========================================

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorer si l'utilisateur tape dans un champ de saisie
    const target = event.target as HTMLElement;
    const isInputField = target.matches('input, textarea, select, [contenteditable]');
    
    // Permettre certains raccourcis même dans les champs de saisie
    const allowedInInput = ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5'];
    
    if (isInputField && !allowedInInput.includes(event.key)) {
      // Permettre uniquement Ctrl+S pour sauvegarder dans les champs
      if (!(event.ctrlKey && event.key === 's')) {
        return;
      }
    }

    // Rechercher le raccourci correspondant
    for (const shortcut of shortcutsRef.current) {
      if (shortcut.disabled) continue;

      const ctrlMatch = (shortcut.ctrlKey || shortcut.metaKey) ? 
        (event.ctrlKey || event.metaKey) : 
        !(event.ctrlKey || event.metaKey);
      
      const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        event.stopPropagation();
        
        try {
          shortcut.action();
          
          // Annoncer le raccourci si les annonces sont activées
          if (preferences.announcements) {
            announce(`Raccourci activé: ${shortcut.description}`);
          }
        } catch (error) {
          console.error('Erreur lors de l\'exécution du raccourci:', error);
          announce('Erreur lors de l\'exécution du raccourci');
        }
        
        break;
      }
    }
  }, [preferences.announcements, announce]);

  // ==========================================
  // EFFETS
  // ==========================================

  useEffect(() => {
    if (!preferences.keyboardOnly && !document.body.classList.contains('keyboard-navigation')) {
      return; // Pas de raccourcis si pas en mode clavier
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, preferences.keyboardOnly]);

  // ==========================================
  // API PUBLIQUE
  // ==========================================

  const addCustomShortcut = useCallback((shortcut: ShortcutConfig) => {
    shortcutsRef.current = [...shortcutsRef.current, shortcut];
  }, []);

  const removeCustomShortcut = useCallback((key: string, modifiers: Partial<Pick<ShortcutConfig, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>> = {}) => {
    shortcutsRef.current = shortcutsRef.current.filter(s => 
      !(s.key === key && 
        s.ctrlKey === modifiers.ctrlKey &&
        s.altKey === modifiers.altKey &&
        s.shiftKey === modifiers.shiftKey &&
        s.metaKey === modifiers.metaKey)
    );
  }, []);

  const getAvailableShortcuts = useCallback(() => {
    return groupShortcutsByCategory(shortcutsRef.current);
  }, [groupShortcutsByCategory]);

  return {
    showShortcutsHelp,
    openCommandPalette,
    addCustomShortcut,
    removeCustomShortcut,
    getAvailableShortcuts,
    formatShortcutKey
  };
};