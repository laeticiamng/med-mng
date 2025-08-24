import { useEffect, useCallback } from 'react';
import { appNavigate } from "@/lib/navigation";
import { toast } from '@/hooks/use-toast';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[] = []) => {

  const defaultShortcuts: ShortcutConfig[] = [
    {
      key: 'h',
      ctrlKey: true,
      action: () => appNavigate('/'),
      description: 'Aller à l\'accueil'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => appNavigate('/edn'),
      description: 'Ouvrir EDN Explorer'
    },
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: () => appNavigate('/chat'),
      description: 'Ouvrir le Chat IA'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: () => appNavigate('/med-mng'),
      description: 'Ouvrir MED-MNG'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => showShortcutsHelp(),
      description: 'Afficher les raccourcis'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => openCommandPalette(),
      description: 'Ouvrir la palette de commandes'
    }
  ];

  const showShortcutsHelp = useCallback(() => {
    const allShortcuts = [...defaultShortcuts, ...shortcuts];
    const shortcutsList = allShortcuts.map(s => 
      `${s.ctrlKey ? 'Ctrl+' : ''}${s.altKey ? 'Alt+' : ''}${s.shiftKey ? 'Shift+' : ''}${s.key.toUpperCase()}: ${s.description}`
    ).join('\n');
    
    toast({
      title: "Raccourcis clavier disponibles",
      description: shortcutsList,
      duration: 8000
    });
  }, [shortcuts]);

  const openCommandPalette = useCallback(() => {
    // Pour une future implémentation de palette de commandes
    toast({
      title: "Palette de commandes",
      description: "Fonctionnalité à venir..."
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const allShortcuts = [...defaultShortcuts, ...shortcuts];
    
    for (const shortcut of allShortcuts) {
      const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showShortcutsHelp,
    openCommandPalette
  };
};