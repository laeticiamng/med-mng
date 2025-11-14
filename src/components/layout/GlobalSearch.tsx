import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Music,
  Users,
  Package,
  Settings,
  Home,
  Book,
  Sparkles,
  Search,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_PATHS } from '@/config/routes';
import { analyticsService } from '@/services/analyticsService';

/**
 * Interface pour un résultat de recherche
 */
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'page' | 'item' | 'user' | 'song' | 'recent';
  href: string;
  icon?: React.ReactNode;
}

/**
 * Données de recherche statiques pour MVP
 */
const SEARCH_DATA: SearchResult[] = [
  // Pages principales
  { id: 'home', title: 'Accueil', category: 'page', href: ROUTE_PATHS.home, icon: <Home className="w-4 h-4" /> },
  { id: 'edn', title: 'EDN Items', description: 'Bibliothèque de 367 items', category: 'page', href: ROUTE_PATHS.ednComplete, icon: <Book className="w-4 h-4" /> },
  { id: 'ecos', title: 'ECOS Scénarios', description: 'Scénarios cliniques interactifs', category: 'page', href: ROUTE_PATHS.ecosIndex, icon: <Sparkles className="w-4 h-4" /> },
  { id: 'chat', title: 'Chat IA', description: 'Assistant médical intelligent', category: 'page', href: ROUTE_PATHS.chat, icon: <Sparkles className="w-4 h-4" /> },
  { id: 'generator', title: 'Générateur Musical', description: 'Créer de la musique médicale', category: 'page', href: ROUTE_PATHS.generator, icon: <Music className="w-4 h-4" /> },
  { id: 'dashboard', title: 'Dashboard', description: 'Progression apprentissage', category: 'page', href: ROUTE_PATHS.dashboard, icon: <FileText className="w-4 h-4" /> },
  { id: 'audit', title: 'Audit Complet', description: 'Analyse exhaustive des items', category: 'page', href: ROUTE_PATHS.audit, icon: <FileText className="w-4 h-4" /> },
  { id: 'store', title: 'Boutique', description: 'Shop de produits', category: 'page', href: ROUTE_PATHS.store, icon: <Package className="w-4 h-4" /> },
  { id: 'community', title: 'Communauté', description: 'Forum utilisateurs', category: 'page', href: ROUTE_PATHS.community, icon: <Users className="w-4 h-4" /> },
  { id: 'settings', title: 'Paramètres', description: 'Profil et préférences', category: 'page', href: ROUTE_PATHS.settings, icon: <Settings className="w-4 h-4" /> },
];

/**
 * Props pour GlobalSearch
 */
interface GlobalSearchProps {
  className?: string;
}

/**
 * GlobalSearch Component
 *
 * Command palette style search accessible via:
 * - ⌘K (Mac)
 * - Ctrl+K (Windows/Linux)
 * - / key anywhere
 *
 * Features:
 * - Fuzzy search
 * - Category grouping
 * - Recent searches
 * - Keyboard navigation
 * - Analytics tracking
 *
 * @example
 * // Use in App.tsx root
 * <GlobalSearch />
 */
export const GlobalSearch = React.forwardRef<HTMLDivElement, GlobalSearchProps>(
  ({ className }, ref) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Load recent searches from localStorage
     */
    useEffect(() => {
      try {
        const stored = localStorage.getItem('med-mng-recent-searches');
        if (stored) {
          setRecentSearches(JSON.parse(stored).slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }, []);

    /**
     * Save search to recent searches
     */
    const saveToRecentSearches = useCallback((query: string) => {
      if (!query.trim()) return;

      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== query);
        const updated = [query, ...filtered].slice(0, 5);
        localStorage.setItem('med-mng-recent-searches', JSON.stringify(updated));
        return updated;
      });
    }, []);

    /**
     * Filter search results basé sur la query
     */
    const filteredResults = React.useMemo(() => {
      if (!searchQuery.trim()) {
        return [];
      }

      const query = searchQuery.toLowerCase();

      // Simple fuzzy search
      return SEARCH_DATA.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descriptionMatch = item.description?.toLowerCase().includes(query);
        return titleMatch || descriptionMatch;
      });
    }, [searchQuery]);

    /**
     * Keyboard shortcuts setup
     */
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // ⌘K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
        // / key
        else if (e.key === '/' && !open) {
          e.preventDefault();
          setOpen(true);
        }
        // Escape
        else if (e.key === 'Escape') {
          setOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    /**
     * Handle search result click
     */
    const handleSelect = useCallback(
      (result: SearchResult) => {
        saveToRecentSearches(result.title);

        // Track analytics
        analyticsService.trackEvent('global_search_result_clicked', {
          query: searchQuery,
          resultId: result.id,
          resultCategory: result.category,
        });

        // Navigate
        navigate(result.href);
        setOpen(false);
        setSearchQuery('');
      },
      [searchQuery, navigate, saveToRecentSearches]
    );

    /**
     * Display results by category
     */
    const resultsByCategory = React.useMemo(() => {
      const grouped: Record<string, SearchResult[]> = {};

      filteredResults.forEach((result) => {
        if (!grouped[result.category]) {
          grouped[result.category] = [];
        }
        grouped[result.category].push(result);
      });

      return grouped;
    }, [filteredResults]);

    /**
     * Get icon for category
     */
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'page':
          return <FileText className="w-4 h-4" />;
        case 'item':
          return <Book className="w-4 h-4" />;
        case 'song':
          return <Music className="w-4 h-4" />;
        case 'user':
          return <Users className="w-4 h-4" />;
        case 'recent':
          return <Clock className="w-4 h-4" />;
        default:
          return <Search className="w-4 h-4" />;
      }
    };

    /**
     * Get category label
     */
    const getCategoryLabel = (category: string) => {
      switch (category) {
        case 'page':
          return 'Pages';
        case 'item':
          return 'Items EDN';
        case 'song':
          return 'Chansons';
        case 'user':
          return 'Utilisateurs';
        case 'recent':
          return 'Récemment consultés';
        default:
          return 'Résultats';
      }
    };

    return (
      <>
        {/* Trigger Button - Affichage dans navbar */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
            className
          )}
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">Rechercher...</span>
          <span className="inline-flex lg:hidden">Chercher...</span>
          <kbd className="pointer-events-none absolute right-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Command Dialog - Modal recherche */}
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput
            ref={inputRef}
            placeholder="Rechercher pages, items, utilisateurs..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onFocus={() => {
              analyticsService.trackEvent('global_search_opened', {
                trigger: 'input_focus',
              });
            }}
          />

          <CommandList>
            {/* Empty State */}
            {searchQuery && filteredResults.length === 0 && (
              <CommandEmpty>
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucun résultat pour "{searchQuery}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Essayez une autre recherche
                  </p>
                </div>
              </CommandEmpty>
            )}

            {/* Affichage: Recherche en cours */}
            {searchQuery && Object.keys(resultsByCategory).length > 0 && (
              <>
                {Object.entries(resultsByCategory).map(([category, results]) => (
                  <CommandGroup
                    key={category}
                    heading={getCategoryLabel(category)}
                  >
                    {results.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {result.icon || getCategoryIcon(category)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.title}</p>
                            {result.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}

            {/* Affichage: Pas de recherche (recents + suggestions) */}
            {!searchQuery && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Récemment">
                    {recentSearches.map((recent) => (
                      <CommandItem
                        key={`recent-${recent}`}
                        onSelect={() => {
                          setSearchQuery(recent);
                          analyticsService.trackEvent('recent_search_clicked', {
                            search: recent,
                          });
                        }}
                        className="cursor-pointer"
                      >
                        <Clock className="mr-2 h-4 w-4 opacity-50" />
                        <span>{recent}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Popular Pages */}
                <CommandGroup heading="Pages populaires">
                  {SEARCH_DATA.filter((item) => item.category === 'page')
                    .slice(0, 6)
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {result.icon}
                          <div>
                            <p className="font-medium">{result.title}</p>
                            {result.description && (
                              <p className="text-xs text-muted-foreground">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>

          {/* Keyboard Hints */}
          <div className="border-t px-4 py-3 text-xs text-muted-foreground flex gap-4">
            <div className="flex gap-2 items-center">
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
              <span>Navigation</span>
            </div>
            <div className="flex gap-2 items-center">
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs">⏎</kbd>
              <span>Sélectionner</span>
            </div>
            <div className="flex gap-2 items-center">
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs">ESC</kbd>
              <span>Fermer</span>
            </div>
          </div>
        </CommandDialog>
      </>
    );
  }
);

GlobalSearch.displayName = 'GlobalSearch';

export default GlobalSearch;
