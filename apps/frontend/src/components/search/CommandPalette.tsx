import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  BookOpen, 
  Music, 
  Users, 
  Library, 
  Home, 
  BarChart3, 
  MessageSquare,
  ShoppingBag,
  Search,
  FileText,
  Stethoscope,
  Hash,
  TrendingUp,
  Clock,
  Heart,
  Activity,
  Zap,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { useRecentSearches } from '@/hooks/useRecentSearches';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// EDN Categories mapping
const EDN_CATEGORIES: Record<string, string[]> = {
  'Cardiologie': ['1', '2', '197', '198', '199', '200', '228', '229', '230', '231', '232', '233', '234', '235', '236'],
  'Pneumologie': ['86', '87', '88', '89', '151', '152', '153', '154', '201', '202', '203', '204', '205'],
  'Gastro-entérologie': ['90', '91', '92', '93', '94', '147', '148', '149', '150', '268', '269', '270', '271'],
  'Néphrologie': ['252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263'],
  'Neurologie': ['96', '97', '98', '99', '100', '101', '102', '103', '335', '336', '337', '338', '339'],
  'Endocrinologie': ['219', '220', '221', '222', '223', '224', '225', '226', '227', '241', '242', '243'],
  'Hématologie': ['209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '312', '313'],
  'Rhumatologie': ['192', '193', '194', '195', '196', '354', '355', '356', '357', '358', '359'],
  'Infectiologie': ['159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169'],
  'Urgences': ['327', '328', '329', '330', '331', '332', '333', '334', '340', '341', '342'],
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { recents, addRecent } = useRecentSearches();

  // Fetch all EDN items for fuzzy search
  const { data: allEdnItems = [], isLoading } = useQuery({
    queryKey: ['all-edn-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edn_items' as any)
        .select('item_number, title, specialty')
        .order('item_number', { ascending: true });

      if (error) {
        console.error('Error fetching EDN items:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allEdnItems, {
      keys: ['item_number', 'title', 'specialty'],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      includeScore: true,
      includeMatches: true,
    });
  }, [allEdnItems]);

  // Fuzzy search in EDN items
  const filteredEdnItems = useMemo(() => {
    if (!search || search.length < 2) return [];

    // Quick number search
    const searchNum = parseInt(search);
    if (!isNaN(searchNum)) {
      const exactMatch = allEdnItems.filter((item: any) => 
        item.item_number?.toString().startsWith(search)
      );
      if (exactMatch.length > 0) {
        return exactMatch.slice(0, 10);
      }
    }

    // Fuzzy search for text
    const results = fuse.search(search);
    return results.slice(0, 10).map(result => result.item);
  }, [search, allEdnItems, fuse]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const categories: Record<string, any[]> = {};
    
    filteredEdnItems.forEach((item: any) => {
      const itemNum = item.item_number?.toString();
      let foundCategory = 'Autres';
      
      for (const [category, numbers] of Object.entries(EDN_CATEGORIES)) {
        if (Array.isArray(numbers) && numbers.includes(itemNum)) {
          foundCategory = category;
          break;
        }
      }
      
      if (!categories[foundCategory]) {
        categories[foundCategory] = [];
      }
      categories[foundCategory].push(item);
    });
    
    return categories;
  }, [filteredEdnItems]);

  // Highlight matching text
  const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-primary font-medium rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const mainPages = [
    { icon: Home, label: 'Accueil', path: ROUTE_PATHS.home, keywords: ['home', 'accueil'] },
    { icon: BookOpen, label: 'Items EDN', path: ROUTE_PATHS.ednComplete, keywords: ['edn', 'items', 'révision', 'cours'] },
    { icon: Music, label: 'Générateur Musical', path: ROUTE_PATHS.generator, keywords: ['musique', 'génération', 'ia', 'chanson'] },
    { icon: Users, label: 'ECOS', path: ROUTE_PATHS.ecosIndex, keywords: ['ecos', 'examen', 'pratique'] },
    { icon: Library, label: 'Bibliothèque', path: ROUTE_PATHS.medMngLibrary, keywords: ['bibliothèque', 'musiques', 'collection'] },
    { icon: BarChart3, label: 'Dashboard', path: ROUTE_PATHS.dashboard, keywords: ['dashboard', 'statistiques', 'progression'] },
    { icon: MessageSquare, label: 'Assistant IA', path: ROUTE_PATHS.chat, keywords: ['chat', 'ia', 'assistant', 'aide'] },
    { icon: ShoppingBag, label: 'Store', path: ROUTE_PATHS.store, keywords: ['store', 'boutique', 'achats'] },
  ];

  const handleSelect = (path: string, label: string, type: 'page' | 'edn-item' = 'page') => {
    addRecent({ type, label, path });
    navigate(path);
    onOpenChange(false);
    setSearch('');
  };

  const filteredPages = mainPages.filter(page => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      page.label.toLowerCase().includes(searchLower) ||
      page.keywords.some(k => k.includes(searchLower))
    );
  });

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Rechercher des items EDN, pages..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p>Aucun résultat trouvé</p>
            <p className="text-xs mt-2">Essayez une recherche floue ou par catégorie</p>
          </div>
        </CommandEmpty>

        {/* Recent Searches */}
        {!search && recents.length > 0 && (
          <CommandGroup heading="Récent">
            {recents.map((recent) => {
              const Icon = recent.type === 'edn-item' ? Stethoscope : Clock;
              return (
                <CommandItem
                  key={recent.id}
                  onSelect={() => handleSelect(recent.path, recent.label, recent.type)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{recent.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {recent.type === 'edn-item' ? 'EDN' : 'Page'}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {filteredPages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pages principales">
              {filteredPages.map((page) => (
                <CommandItem
                  key={page.path}
                  onSelect={() => handleSelect(page.path, page.label, 'page')}
                  className="gap-2"
                >
                  <page.icon className="h-4 w-4" />
                  <span>{page.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {search.length >= 2 && (
          <>
            <CommandSeparator />
            {isLoading ? (
              <CommandGroup heading="Items EDN">
                <CommandItem disabled className="text-sm text-muted-foreground">
                  <Search className="h-4 w-4 mr-2 animate-pulse" />
                  Recherche fuzzy en cours...
                </CommandItem>
              </CommandGroup>
            ) : Object.keys(itemsByCategory).length > 0 ? (
              // Display items grouped by category
              Object.entries(itemsByCategory).map(([category, items]) => (
                <CommandGroup key={category} heading={`${category} (${items.length})`}>
                  {items.map((item: any) => (
                    <CommandItem
                      key={item.item_number}
                      onSelect={() => {
                        handleSelect(
                          `${ROUTE_PATHS.ednComplete}?item=${item.item_number}`,
                          `Item ${item.item_number} - ${item.title}`,
                          'edn-item'
                        );
                      }}
                      className="gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Stethoscope className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {item.item_number}
                            </Badge>
                            <span className="font-medium text-sm truncate">
                              {highlightMatch(item.title || '', search)}
                            </span>
                          </div>
                          {item.specialty && (
                            <span className="text-xs text-muted-foreground truncate">
                              {highlightMatch(item.specialty, search)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : filteredEdnItems.length === 0 ? (
              <CommandGroup heading="Items EDN">
                <CommandItem disabled className="text-sm text-muted-foreground">
                  <Search className="h-4 w-4 mr-2" />
                  Aucun item trouvé - Essayez une recherche différente
                </CommandItem>
              </CommandGroup>
            ) : null}
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Aide">
          <CommandItem disabled className="text-xs text-muted-foreground flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> ou <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> - Ouvrir
          </CommandItem>
          <CommandItem disabled className="text-xs text-muted-foreground flex items-center gap-2">
            <Activity className="h-3 w-3" />
            Recherche floue activée - Résultats approximatifs
          </CommandItem>
          <CommandItem disabled className="text-xs text-muted-foreground flex items-center gap-2">
            <Heart className="h-3 w-3" />
            Organisé par spécialités médicales
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
