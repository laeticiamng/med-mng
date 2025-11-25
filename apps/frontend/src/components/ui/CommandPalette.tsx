import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  BookOpen,
  Music,
  Settings,
  Search,
  HelpCircle,
  User,
  LogOut,
  Moon,
  Sun,
  Keyboard,
  Target,
  Trophy,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  BarChart3,
  Bell,
  Shield,
  Download,
} from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useTheme } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  group: 'navigation' | 'search' | 'actions' | 'settings' | 'user';
  keywords?: string[];
}

interface RecentSearch {
  query: string;
  type: 'item' | 'quiz' | 'general';
  timestamp: Date;
}

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Fetch quick search results for EDN items
  const { data: searchResults } = useQuery({
    queryKey: ['command-palette-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      try {
        // Search in edn_items table
        const { data, error } = await (supabase as any)
          .from('edn_items')
          .select('item_number, title, speciality')
          .or(`item_number.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error('Command palette search error:', error);
        return [];
      }
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  // Listen for keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Listen for custom event from KeyboardShortcuts
  useEffect(() => {
    const handleOpenPalette = () => setOpen(true);
    document.addEventListener('open-command-palette', handleOpenPalette);
    return () => document.removeEventListener('open-command-palette', handleOpenPalette);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('command-palette-recent');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        })));
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, []);

  const saveRecentSearch = useCallback((query: string, type: RecentSearch['type']) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.query !== query);
      const newSearches = [
        { query, type, timestamp: new Date() },
        ...filtered,
      ].slice(0, 5);
      localStorage.setItem('command-palette-recent', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  const runCommand = useCallback((callback: () => void, searchTerm?: string) => {
    setOpen(false);
    if (searchTerm) {
      saveRecentSearch(searchTerm, 'general');
    }
    callback();
  }, [saveRecentSearch]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'home',
      label: 'Accueil',
      description: 'Retourner au tableau de bord',
      icon: <Home className="w-4 h-4" />,
      shortcut: ['⌘', 'H'],
      action: () => navigate('/'),
      group: 'navigation',
      keywords: ['dashboard', 'main', 'home'],
    },
    {
      id: 'edn',
      label: 'EDN Complet',
      description: 'Parcourir les items EDN',
      icon: <BookOpen className="w-4 h-4" />,
      shortcut: ['⌘', 'E'],
      action: () => navigate('/edn-complete'),
      group: 'navigation',
      keywords: ['items', 'learn', 'study', 'edn'],
    },
    {
      id: 'music',
      label: 'Bibliothèque Musicale',
      description: 'Générer et écouter de la musique',
      icon: <Music className="w-4 h-4" />,
      shortcut: ['⌘', 'M'],
      action: () => navigate('/med-mng-library'),
      group: 'navigation',
      keywords: ['songs', 'audio', 'music', 'library'],
    },
    {
      id: 'quiz',
      label: 'Quiz',
      description: 'Tester vos connaissances',
      icon: <Target className="w-4 h-4" />,
      action: () => navigate('/quiz'),
      group: 'navigation',
      keywords: ['test', 'exam', 'quiz'],
    },
    {
      id: 'chat',
      label: 'Assistant IA',
      description: 'Discuter avec l\'assistant',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => navigate('/chat'),
      group: 'navigation',
      keywords: ['ai', 'chat', 'assistant', 'help'],
    },
    {
      id: 'leaderboard',
      label: 'Classement',
      description: 'Voir le classement des utilisateurs',
      icon: <Trophy className="w-4 h-4" />,
      action: () => navigate('/leaderboard'),
      group: 'navigation',
      keywords: ['rank', 'ranking', 'score', 'leaderboard'],
    },
    {
      id: 'progress',
      label: 'Ma progression',
      description: 'Suivre votre avancement',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => navigate('/progress'),
      group: 'navigation',
      keywords: ['stats', 'statistics', 'progress'],
    },

    // Actions
    {
      id: 'search',
      label: 'Rechercher un item',
      description: 'Rechercher dans les items EDN',
      icon: <Search className="w-4 h-4" />,
      shortcut: ['⌘', 'K'],
      action: () => {
        navigate('/edn-complete');
        // Could trigger search focus on the page
      },
      group: 'actions',
      keywords: ['find', 'search', 'look'],
    },
    {
      id: 'shortcuts',
      label: 'Raccourcis clavier',
      description: 'Voir tous les raccourcis',
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: ['?'],
      action: () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      },
      group: 'actions',
      keywords: ['keyboard', 'shortcuts', 'keys'],
    },
    {
      id: 'help',
      label: 'Aide',
      description: 'Centre d\'aide et documentation',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => navigate('/help'),
      group: 'actions',
      keywords: ['help', 'support', 'faq'],
    },

    // Settings
    {
      id: 'settings',
      label: 'Paramètres',
      description: 'Gérer vos préférences',
      icon: <Settings className="w-4 h-4" />,
      shortcut: ['⌘', ','],
      action: () => navigate('/user-settings'),
      group: 'settings',
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Gérer les notifications',
      icon: <Bell className="w-4 h-4" />,
      action: () => navigate('/user-settings?tab=notifications'),
      group: 'settings',
      keywords: ['alerts', 'notifications'],
    },
    {
      id: 'privacy',
      label: 'Confidentialité',
      description: 'Paramètres de confidentialité',
      icon: <Shield className="w-4 h-4" />,
      action: () => navigate('/user-settings?tab=privacy'),
      group: 'settings',
      keywords: ['privacy', 'security', 'data'],
    },
    {
      id: 'export',
      label: 'Exporter mes données',
      description: 'Télécharger vos données personnelles',
      icon: <Download className="w-4 h-4" />,
      action: () => navigate('/user-settings?tab=data'),
      group: 'settings',
      keywords: ['export', 'download', 'gdpr'],
    },
    {
      id: 'theme',
      label: theme === 'dark' ? 'Mode clair' : 'Mode sombre',
      description: 'Changer le thème de l\'interface',
      icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      group: 'settings',
      keywords: ['theme', 'dark', 'light', 'mode'],
    },

    // User
    {
      id: 'profile',
      label: 'Mon profil',
      description: 'Voir et modifier votre profil',
      icon: <User className="w-4 h-4" />,
      action: () => navigate('/profile'),
      group: 'user',
      keywords: ['profile', 'account', 'me'],
    },
    ...(user ? [{
      id: 'logout',
      label: 'Déconnexion',
      description: 'Se déconnecter de votre compte',
      icon: <LogOut className="w-4 h-4" />,
      action: () => signOut(),
      group: 'user' as const,
      keywords: ['logout', 'signout', 'disconnect'],
    }] : []),
  ], [navigate, theme, setTheme, user, signOut]);

  const groupLabels: Record<string, string> = {
    navigation: 'Navigation',
    search: 'Recherche',
    actions: 'Actions',
    settings: 'Paramètres',
    user: 'Compte',
  };

  const filteredCommands = useMemo(() => {
    if (!searchQuery) return commands;

    const query = searchQuery.toLowerCase();
    return commands.filter((cmd) => {
      return (
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.keywords?.some((k) => k.includes(query))
      );
    });
  }, [commands, searchQuery]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.group]) {
        groups[cmd.group] = [];
      }
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Rechercher une commande ou un item..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucun résultat trouvé</p>
            <p className="text-sm text-muted-foreground/70">
              Essayez une autre recherche
            </p>
          </div>
        </CommandEmpty>

        {/* EDN Search Results */}
        {searchResults && searchResults.length > 0 && (
          <>
            <CommandGroup heading="Items EDN">
              {searchResults.map((item: any) => (
                <CommandItem
                  key={item.item_number}
                  onSelect={() => {
                    saveRecentSearch(item.item_number, 'item');
                    setOpen(false);
                    navigate(`/edn-complete?item=${item.item_number}`);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Item {item.item_number}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {item.title}
                    </span>
                  </div>
                  {item.speciality && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.speciality}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recherches récentes">
              {recentSearches.map((recent, index) => (
                <CommandItem
                  key={`recent-${index}`}
                  onSelect={() => {
                    setSearchQuery(recent.query);
                    if (recent.type === 'item') {
                      setOpen(false);
                      navigate(`/edn-complete?item=${recent.query}`);
                    }
                  }}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{recent.query}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {recent.type === 'item' ? 'Item' : 'Recherche'}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Command Groups */}
        {Object.entries(groupedCommands).map(([group, items], index) => (
          <React.Fragment key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={groupLabels[group] || group}>
              {items.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => runCommand(cmd.action, searchQuery || undefined)}
                >
                  {cmd.icon}
                  <span className="ml-2">{cmd.label}</span>
                  {cmd.description && (
                    <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                      — {cmd.description}
                    </span>
                  )}
                  {cmd.shortcut && (
                    <CommandShortcut>
                      {cmd.shortcut.join('')}
                    </CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}

        {/* Quick Actions */}
        {!searchQuery && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions rapides">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  navigate('/edn-complete?random=true');
                }}
              >
                <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Item aléatoire</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  Étudier un item au hasard
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  navigate('/quiz?quick=true');
                }}
              >
                <Target className="mr-2 h-4 w-4 text-green-500" />
                <span>Quiz rapide</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  10 questions aléatoires
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
