// Unified Global Search across all modules
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, VisuallyHidden } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { rechercherCompetences, regrouperParItem } from '@/lib/rechercheCompetences';
import { contientRecherche, motifRecherche } from '@/lib/motifRecherche';
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
  clinical: { icon: BookOpen, label: 'Cas cliniques', color: 'bg-accent/20 text-emerald-700 dark:text-emerald-400' },
};

export const GlobalSearchBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  /**
   * Numéro de la dernière recherche lancée : la réponse d'une recherche plus ancienne
   * (« insuffisance », tapée avant « insuffisance cardiaque ») arrivée en retard ne doit
   * pas remplacer les résultats de la recherche en cours (test en production du 09.10.2026).
   */
  const derniereRecherche = useRef(0);

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
    const numeroRecherche = ++derniereRecherche.current;
    const perimee = () => numeroRecherche !== derniereRecherche.current;
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
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
      // Titre : insensible aux accents et au singulier/pluriel (« diabete » → « Diabète »,
      // « accident vasculaire cérébral » → « Accidents vasculaires cérébraux ») ; code et
      // discipline : comme avant.
      const motifTitre = numero ? null : motifRecherche(q);
      const [{ data: parCode }, parTitre] = await Promise.all([
        numero
          ? requete.eq('item_code', `IC-${numero}`).limit(1)
          : requete
              .or(`title.ilike.%${q}%,item_code.ilike.%${q}%,specialite.ilike.%${q}%`)
              .order('item_code')
              .limit(8),
        motifTitre
          ? supabase
              .from('edn_items_complete')
              .select('id, item_code, title, slug, specialite')
              .eq('status', 'active')
              .filter('title', 'imatch', motifTitre)
              .order('item_code')
              .limit(8)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      const ednItems = [...(parTitre.data ?? []), ...(parCode ?? [])].filter(
        (item: any, i: number, tous: any[]) => tous.findIndex((x: any) => x.id === item.id) === i,
      );

      if (ednItems) {
        ednItems.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            title: `${item.item_code} - ${item.title}`,
            description: item.specialite || undefined,
            category: 'edn',
            url: `/edn-complete/${item.slug || item.item_code.toLowerCase()}`,
            relevance: contientRecherche(item.title, q) || item.title.toLowerCase().includes(q.toLowerCase()) ? 100 : 50,
          });
        });
      }

      // Items trouvés par l'intitulé d'une compétence officielle (« otoscopie »
      // → IC-150), absents des résultats par titre.
      if (!numero) {
        const dejaTrouves = new Set(searchResults.map(r => r.title.split(' - ')[0]));
        const parItem = regrouperParItem(await rechercherCompetences(q));
        // L'item dont le plus de compétences correspondent d'abord (« AVC » : l'IC-340
        // « Accidents vasculaires cérébraux » avant l'IC-221 « Athérome », qui le cite une fois).
        const nombre = (c: string) => parItem.get(c)?.length ?? 0;
        const codes = [...parItem.keys()]
          .filter(c => !dejaTrouves.has(c))
          .sort((a, b) => nombre(b) - nombre(a))
          .slice(0, 8);
        if (codes.length > 0) {
          const { data: itemsCompetences } = await supabase
            .from('edn_items_complete')
            .select('id, item_code, title, slug')
            .eq('status', 'active')
            .in('item_code', codes);
          (itemsCompetences ?? []).forEach((item) => {
            const competence = parItem.get(item.item_code)?.[0];
            searchResults.push({
              id: item.id,
              title: `${item.item_code} - ${item.title}`,
              description: competence ? `Compétence : ${competence.intitule}` : undefined,
              category: 'edn',
              url: `/edn-complete/${item.slug || item.item_code.toLowerCase()}`,
              relevance: 40 + Math.min(nombre(item.item_code), 9),
            });
          });
        }
      }

      // Cas cliniques générés par IA : retirés de l'offre (DC7, 04.10.2026), plus proposés.

      // Pertinence, puis numéro d'item (IC-234 avant IC-348 à pertinence égale)
      const numeroDe = (r: SearchResult) => parseInt(/IC-(\d+)/.exec(r.title)?.[1] ?? '9999', 10);
      searchResults.sort((a, b) => b.relevance - a.relevance || numeroDe(a) - numeroDe(b));
      if (perimee()) return;
      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Search error:', error);
    } finally {
      if (!perimee()) setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    // Dès que la saisie change, toute recherche en cours est périmée (revue Codex #241) :
    // sa réponse, même reçue pendant le délai de 300 ms, ne doit rien afficher.
    derniereRecherche.current += 1;
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
        {/* Titre lu par les lecteurs d'écran (Radix l'exige ; erreur console sinon). */}
        <VisuallyHidden>
          <DialogTitle>Rechercher un item ou une compétence</DialogTitle>
          <DialogDescription>Numéro, titre d'item EDN ou intitulé de compétence.</DialogDescription>
        </VisuallyHidden>
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
