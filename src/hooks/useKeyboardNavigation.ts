import { useEffect, useCallback, useState, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
  onBackspace?: () => void;
  onDelete?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  enabled?: boolean;
  preventDefaultOnArrows?: boolean;
  stopPropagation?: boolean;
}

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description?: string;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    onBackspace,
    onDelete,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    enabled = true,
    preventDefaultOnArrows = true,
    stopPropagation = false
  } = options;

  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [isModifierPressed, setIsModifierPressed] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorer si on est dans un input/textarea (sauf pour certaines touches)
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const shouldIgnore = isInputField && !['Escape', 'Tab'].includes(event.key);
    if (shouldIgnore) return;

    setLastKeyPressed(event.key);
    setIsModifierPressed(event.ctrlKey || event.metaKey || event.altKey);

    if (stopPropagation) {
      event.stopPropagation();
    }

    switch (event.key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'ArrowUp':
        if (preventDefaultOnArrows) event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        if (preventDefaultOnArrows) event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        if (preventDefaultOnArrows) event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        if (preventDefaultOnArrows) event.preventDefault();
        onArrowRight?.();
        break;
      case 'Tab':
        if (event.shiftKey) {
          onShiftTab?.();
        } else {
          onTab?.();
        }
        break;
      case ' ':
        onSpace?.();
        break;
      case 'Backspace':
        if (!isInputField) onBackspace?.();
        break;
      case 'Delete':
        if (!isInputField) onDelete?.();
        break;
      case 'Home':
        onHome?.();
        break;
      case 'End':
        onEnd?.();
        break;
      case 'PageUp':
        onPageUp?.();
        break;
      case 'PageDown':
        onPageDown?.();
        break;
    }
  }, [
    enabled,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    onBackspace,
    onDelete,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    preventDefaultOnArrows,
    stopPropagation
  ]);

  const handleKeyUp = useCallback(() => {
    setIsModifierPressed(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [handleKeyDown, handleKeyUp, enabled]);

  return {
    handleKeyDown,
    lastKeyPressed,
    isModifierPressed
  };
};

// Hook pour gérer des raccourcis clavier personnalisés
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) => {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      for (const shortcut of shortcutsRef.current) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrlKey || (shortcut.ctrlKey && (event.ctrlKey || event.metaKey));
        const shiftMatch = !shortcut.shiftKey || (shortcut.shiftKey && event.shiftKey);
        const altMatch = !shortcut.altKey || (shortcut.altKey && event.altKey);

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.callback();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  // Retourner la liste des raccourcis pour affichage
  const getShortcutsList = () => {
    return shortcutsRef.current.map(s => ({
      key: s.key,
      modifiers: [
        s.ctrlKey && 'Ctrl',
        s.shiftKey && 'Shift',
        s.altKey && 'Alt',
        s.metaKey && 'Cmd'
      ].filter(Boolean).join('+'),
      description: s.description || 'No description'
    }));
  };

  return { getShortcutsList };
};

// Hook pour navigation dans une liste
export const useListNavigation = <T>(
  items: T[],
  options: {
    onSelect?: (item: T, index: number) => void;
    loop?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const { onSelect, loop = true, enabled = true } = options;
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const { handleKeyDown } = useKeyboardNavigation({
    enabled,
    onArrowUp: () => {
      setFocusedIndex(prev => {
        if (prev <= 0) return loop ? items.length - 1 : 0;
        return prev - 1;
      });
    },
    onArrowDown: () => {
      setFocusedIndex(prev => {
        if (prev >= items.length - 1) return loop ? 0 : items.length - 1;
        return prev + 1;
      });
    },
    onEnter: () => {
      if (focusedIndex >= 0 && focusedIndex < items.length) {
        onSelect?.(items[focusedIndex], focusedIndex);
      }
    },
    onHome: () => setFocusedIndex(0),
    onEnd: () => setFocusedIndex(items.length - 1),
    onEscape: () => setFocusedIndex(-1)
  });

  const focusItem = (index: number) => {
    setFocusedIndex(Math.max(0, Math.min(index, items.length - 1)));
  };

  const resetFocus = () => {
    setFocusedIndex(-1);
  };

  return {
    focusedIndex,
    focusItem,
    resetFocus,
    handleKeyDown,
    isFocused: (index: number) => focusedIndex === index
  };
};

// Hook pour focus trap (modal, dropdown, etc.)
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus le premier élément au montage
    firstElement?.focus();

    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  }, [containerRef, enabled]);
};