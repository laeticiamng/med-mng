// Unified Global Search across all modules
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { BookOpen, Brain, FileText, Loader2, Music, Search, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'edn' | 'quiz' | 'music' | 'clinical' | 'community';
  url: string;
  icon?: React.ReactNode;
  relevance: number;
}

const CATEGORY_CONFIG = {
  edn: { icon: FileText, label: 'EDN', color: 'bg-primary/20 text-primary' },
  quiz: { icon: Brain, label: 'Quiz', color: 'bg-warning/20 text-warning' },
  music: { icon: Music, label: 'Musique', color: 'bg-success/20 text-success' },
  clinical: { icon: BookOpen, label: 'Cas cliniques', color: 'bg-accent/20 text-accent-foreground' },
  community: { icon: Users, label: 'Communauté', color: 'bg-secondary/20 text-secondary-foreground' },
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
      // Search EDN items
      const { _data: ednItems } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, slug')
        .or(`title.ilike.%${searchQuery}%,item_code.ilike.%${searchQuery}%`)
        .limit(5);

      if (ednItems) {
        ednItems.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            title: `${item.item_code} - ${item.title}`,
            category: 'edn',
            url: `/edn/${item.slug}`,
            relevance: item.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 100 : 50,
          });
        });
      }

      // Search quizzes
      const { _data: quizzes } = await supabase
        .from('ai_exam_history')
        .select('id, exam_type, created_at')
        .ilike('exam_type', `%${searchQuery}%`)
        .limit(3);

      if (quizzes) {
        quizzes.forEach((quiz: any) => {
          searchResults.push({
            id: quiz.id,
            title: `Quiz: ${quiz.exam_type}`,
            description: `Créé le ${new Date(quiz.created_at).toLocaleDateString('fr-FR')}`,
            category: 'quiz',
            url: `/exam-mode`,
            relevance: 40,
          });
        });
      }

      // Search generated music
      const { _data: music } = await supabase
        .from('generated_music_tracks')
        .select('id, title, item_code')
        .or(`title.ilike.%${searchQuery}%,item_code.ilike.%${searchQuery}%`)
        .limit(3);

      if (music) {
        music.forEach((track: any) => {
          searchResults.push({
            id: track.id,
            title: track.title || `Musique ${track.item_code}`,
            category: 'music',
            url: `/music-library`,
            relevance: 30,
          });
        });
      }

      // Search clinical cases
      const { _data: cases } = await supabase
        .from('ai_clinical_cases')
        .select('id, title, specialty')
        .or(`title.ilike.%${searchQuery}%,specialty.ilike.%${searchQuery}%`)
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

      // Search community posts
      const { _data: posts } = await supabase
        .from('community_posts')
        .select('id, title, content')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(3);

      if (posts) {
        posts.forEach((post: any) => {
          searchResults.push({
            id: post.id,
            title: post.title,
            description: post.content?.substring(0, 50) + '...',
            category: 'community',
            url: `/community`,
            relevance: 25,
          });
        });
      }

      // Sort by relevance
      searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
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
            placeholder="Rechercher EDN, quiz, musique, cas cliniques..."
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
          <span>{results.length} résultats</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
