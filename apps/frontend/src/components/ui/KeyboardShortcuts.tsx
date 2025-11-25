import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Keyboard,
  Search,
  Home,
  BookOpen,
  Music,
  Settings,
  HelpCircle,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: () => void;
  category: string;
  enabled?: boolean;
}

interface KeyboardShortcutsContextType {
  shortcuts: Shortcut[];
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (key: string) => void;
  showHelp: () => void;
  hideHelp: () => void;
  isHelpOpen: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

const getModifierKey = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return isMac ? '⌘' : 'Ctrl';
};

const formatShortcut = (key: string, modifiers?: string[]): string => {
  const parts: string[] = [];
  const modKey = getModifierKey();

  if (modifiers?.includes('meta') || modifiers?.includes('ctrl')) {
    parts.push(modKey);
  }
  if (modifiers?.includes('alt')) {
    parts.push('Alt');
  }
  if (modifiers?.includes('shift')) {
    parts.push('Shift');
  }

  parts.push(key.toUpperCase());
  return parts.join(' + ');
};

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Default shortcuts
  const defaultShortcuts: Shortcut[] = [
    {
      key: 'k',
      modifiers: ['meta'],
      description: 'Ouvrir la recherche',
      action: () => {
        // Will be handled by CommandPalette
        document.dispatchEvent(new CustomEvent('open-command-palette'));
      },
      category: 'Navigation',
    },
    {
      key: '/',
      modifiers: [],
      description: 'Aide des raccourcis',
      action: () => setIsHelpOpen(true),
      category: 'Aide',
    },
    {
      key: '?',
      modifiers: ['shift'],
      description: 'Aide des raccourcis',
      action: () => setIsHelpOpen(true),
      category: 'Aide',
    },
    {
      key: 'h',
      modifiers: ['meta'],
      description: 'Aller à l\'accueil',
      action: () => navigate('/'),
      category: 'Navigation',
    },
    {
      key: 'e',
      modifiers: ['meta'],
      description: 'Aller aux EDN',
      action: () => navigate('/edn-complete'),
      category: 'Navigation',
    },
    {
      key: 'm',
      modifiers: ['meta'],
      description: 'Aller à la musique',
      action: () => navigate('/med-mng-library'),
      category: 'Navigation',
    },
    {
      key: ',',
      modifiers: ['meta'],
      description: 'Ouvrir les paramètres',
      action: () => navigate('/user-settings'),
      category: 'Navigation',
    },
    {
      key: 'Escape',
      modifiers: [],
      description: 'Fermer le dialogue',
      action: () => setIsHelpOpen(false),
      category: 'Interface',
    },
  ];

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts((prev) => {
      const exists = prev.some((s) => s.key === shortcut.key);
      if (exists) {
        return prev.map((s) => (s.key === shortcut.key ? shortcut : s));
      }
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const showHelp = useCallback(() => setIsHelpOpen(true), []);
  const hideHelp = useCallback(() => setIsHelpOpen(false), []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      const allShortcuts = [...defaultShortcuts, ...shortcuts];

      for (const shortcut of allShortcuts) {
        if (shortcut.enabled === false) continue;

        const modifiers = shortcut.modifiers || [];
        const needsCtrl = modifiers.includes('ctrl') || modifiers.includes('meta');
        const needsAlt = modifiers.includes('alt');
        const needsShift = modifiers.includes('shift');

        const ctrlMatches = needsCtrl ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey);
        const altMatches = needsAlt ? event.altKey : !event.altKey;
        const shiftMatches = needsShift ? event.shiftKey : !event.shiftKey;
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, defaultShortcuts]);

  // Group shortcuts by category
  const groupedShortcuts = [...defaultShortcuts, ...shortcuts].reduce(
    (acc, shortcut) => {
      const category = shortcut.category || 'Autre';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        showHelp,
        hideHelp,
        isHelpOpen,
      }}
    >
      {children}

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Raccourcis clavier
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={`${shortcut.key}-${index}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {formatShortcut(shortcut.key, shortcut.modifiers)
                            .split(' + ')
                            .map((part, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="text-muted-foreground">+</span>}
                                <Badge
                                  variant="outline"
                                  className="px-2 py-0.5 text-xs font-mono"
                                >
                                  {part}
                                </Badge>
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Appuyez sur <Badge variant="outline" className="mx-1 font-mono">?</Badge>
            ou <Badge variant="outline" className="mx-1 font-mono">/</Badge> pour afficher cette aide
          </div>
        </DialogContent>
      </Dialog>
    </KeyboardShortcutsContext.Provider>
  );
};

// Keyboard shortcut indicator component
interface ShortcutBadgeProps {
  shortcut: string;
  modifiers?: string[];
  className?: string;
}

export const ShortcutBadge: React.FC<ShortcutBadgeProps> = ({
  shortcut,
  modifiers,
  className,
}) => {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {formatShortcut(shortcut, modifiers)
        .split(' + ')
        .map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] font-mono h-5"
            >
              {part}
            </Badge>
          </React.Fragment>
        ))}
    </span>
  );
};

export default KeyboardShortcutsProvider;
