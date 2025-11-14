import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Fetch all EDN items for real-time search
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

  // Real-time search in EDN items with highlighting
  const filteredEdnItems = useMemo(() => {
    if (!search || search.length < 2) return [];

    const searchLower = search.toLowerCase();
    const searchNum = parseInt(search);

    return allEdnItems
      .filter((item: any) => {
        // Search by item number (exact or starts with)
        if (!isNaN(searchNum) && item.item_number?.toString().startsWith(search)) {
          return true;
        }
        // Search by title or specialty
        return (
          item.title?.toLowerCase().includes(searchLower) ||
          item.specialty?.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 10); // Limit to 10 results
  }, [search, allEdnItems]);

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

  const handleSelect = (path: string) => {
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
          </div>
        </CommandEmpty>

        {filteredPages.length > 0 && (
          <CommandGroup heading="Pages principales">
            {filteredPages.map((page) => (
              <CommandItem
                key={page.path}
                onSelect={() => handleSelect(page.path)}
                className="gap-2"
              >
                <page.icon className="h-4 w-4" />
                <span>{page.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {search.length >= 2 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Items EDN (${filteredEdnItems.length} résultats)`}>
              {isLoading ? (
                <CommandItem disabled className="text-sm text-muted-foreground">
                  <Search className="h-4 w-4 mr-2 animate-pulse" />
                  Recherche en cours...
                </CommandItem>
              ) : filteredEdnItems.length > 0 ? (
                filteredEdnItems.map((item: any) => (
                  <CommandItem
                    key={item.item_number}
                    onSelect={() => {
                      handleSelect(`${ROUTE_PATHS.ednComplete}?item=${item.item_number}`);
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
                ))
              ) : (
                <CommandItem disabled className="text-sm text-muted-foreground">
                  <Search className="h-4 w-4 mr-2" />
                  Aucun item trouvé pour "{search}"
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Raccourcis">
          <CommandItem disabled className="text-xs text-muted-foreground">
            Utilisez <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> ou <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> pour ouvrir
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
