// Unified Global Search across all modules
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { BookOpen, FileText, Loader2, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'edn' | 'clinical';
  url: string;
  icon?: React.ReactNode;
  relevance: number;
}

const CATEGORY_CONFIG = {
  edn: { icon: FileText, label: 'EDN', color: 'bg-primary/20 text-primary' },
  clinical: { icon: BookOpen, label: 'Cas cliniques', color: 'bg-accent/20 text-accent-foreground' },
};

export const GlobalSearchBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Items EDN : table canonique (367 items actifs), recherche par numéro,
      // code, titre ou discipline. « 230 » trouve IC-230 ; « cardio » trouve
      // les items de cardiologie et ceux dont le titre contient « cardio ».
      //
      // Retirés le 25/09/2026 : les catégories Quiz, Musique et Communauté.
      // Elles menaient à /music-library et /community (aucune route : 404) ou
      // à une page générique, et la requête « Musique » visait une colonne
      // item_code absente de generated_music_tracks.
      const q = searchQuery.trim().replace(/[%,()*]/g, ' ').trim();
      const numero = /^(?:ic[- ]?)?0*(\d{1,3})$/i.exec(q)?.[1];
      const requete = supabase
        .from('edn_items_complete')
        .select('id, item_code, title, slug, specialite')
        .eq('status', 'active');
      const { data: ednItems } = numero
        ? await requete.eq('item_code', `IC-${numero}`).limit(1)
        : await requete
            .or(`title.ilike.%${q}%,item_code.ilike.%${q}%,specialite.ilike.%${q}%`)
            .order('item_code')
            .limit(8);

      if (ednItems) {
        const qMin = q.toLowerCase();
        ednItems.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            title: `${item.item_code} - ${item.title}`,
            description: item.specialite || undefined,
            category: 'edn',
            url: `/edn-complete/${item.slug || item.item_code.toLowerCase()}`,
            relevance: item.title.toLowerCase().includes(qMin) ? 100 : 50,
          });
        });
      }

      // Cas cliniques (lecture soumise aux droits de l'utilisateur).
      const { data: cases } = await supabase
        .from('ai_clinical_cases')
        .select('id, title, specialty')
        .or(`title.ilike.%${q}%,specialty.ilike.%${q}%`)
        .limit(3);

      if (cases) {
        cases.forEach((caseItem: any) => {
          searchResults.push({
            id: caseItem.id,
            title: caseItem.title,
            description: caseItem.specialty,
            category: 'clinical',
            url: `/clinical-cases`,
            relevance: 35,
          });
        });
      }

      // Sort by relevance
      searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(searchResults);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].url);
      setOpen(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setOpen(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full max-w-sm gap-2 text-muted-foreground justify-start">
          <Search className="h-4 w-4" />
          <span>Rechercher...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Numéro, titre ou discipline d'un item EDN…"
            className="border-0 focus-visible:ring-0 text-lg"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => {
                const config = CATEGORY_CONFIG[result.category];
                const Icon = config.icon;
                
                return (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      index === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aucun résultat pour "{query}"
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Tapez au moins 2 caractères pour rechercher
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Badge key={key} variant="outline" className={cn("gap-1", config.color)}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between border-t p-2 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>Esc Fermer</span>
          </div>
          <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
