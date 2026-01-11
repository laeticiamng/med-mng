/**
 * Hook et composant pour les raccourcis clavier du générateur
 * ✅ NOUVEAU: Raccourcis pour génération, annulation, navigation
 */

import React, { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsProps {
  onGenerate: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onToggleHistory?: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onGenerate,
  onCancel,
  onReset,
  onToggleHistory,
  canGenerate,
  isGenerating,
  enabled = true
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorer si dans un input ou textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      !enabled
    ) {
      return;
    }

    // Ctrl/Cmd + Enter: Générer
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (canGenerate && !isGenerating) {
        onGenerate();
        toast.info('⌨️ Génération lancée (Ctrl+Enter)');
      } else if (isGenerating) {
        toast.warning('Génération déjà en cours...');
      }
      return;
    }

    // Escape: Annuler
    if (event.key === 'Escape' && isGenerating && onCancel) {
      event.preventDefault();
      onCancel();
      toast.info('⌨️ Génération annulée (Escape)');
      return;
    }

    // Ctrl/Cmd + R: Reset form (pas le refresh navigateur)
    if ((event.ctrlKey || event.metaKey) && event.key === 'r' && onReset) {
      event.preventDefault();
      onReset();
      toast.info('⌨️ Formulaire réinitialisé (Ctrl+R)');
      return;
    }

    // Ctrl/Cmd + H: Toggle historique
    if ((event.ctrlKey || event.metaKey) && event.key === 'h' && onToggleHistory) {
      event.preventDefault();
      onToggleHistory();
      return;
    }
  }, [onGenerate, onCancel, onReset, onToggleHistory, canGenerate, isGenerating, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Composant d'aide affichant les raccourcis
export const KeyboardShortcutsHelp: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`text-xs text-muted-foreground space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+Enter</kbd>
        <span>Générer</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Escape</kbd>
        <span>Annuler</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+R</kbd>
        <span>Reset</span>
      </div>
    </div>
  );
};
