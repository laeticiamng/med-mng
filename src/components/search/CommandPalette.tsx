import React, { useState, useEffect } from 'react';
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
  Stethoscope
} from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TranslatedText } from '@/components/TranslatedText';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Mock EDN items for search (to be implemented with real data)
  const ednItems = search.length >= 2 ? [] : [];

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

        {ednItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Items EDN">
              <CommandItem disabled className="text-sm text-muted-foreground">
                Recherche en cours de développement...
              </CommandItem>
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
