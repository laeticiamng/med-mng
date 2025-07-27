import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCache } from './useCache';

export interface SearchFilters {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  author?: string;
  tags?: string[];
  rating?: number;
  duration?: {
    min: number;
    max: number;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  author?: string;
  tags: string[];
  rating?: number;
  duration?: number;
  thumbnail?: string;
  createdAt: Date;
  url: string;
  relevanceScore: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const cache = useCache<SearchResult[]>('search-cache');

  const search = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer une clé de cache
      const cacheKey = JSON.stringify({ query, filters, options });
      
      // Vérifier le cache
      const cachedResults = cache.get<SearchResult[]>(cacheKey);
      if (cachedResults) {
        setResults(cachedResults);
        setTotalResults(cachedResults.length);
        return;
      }

      // Recherche via Supabase fonction
      const { data, error: searchError } = await supabase.functions.invoke('advanced-search', {
        body: {
          query: query.trim(),
          filters,
          options: {
            limit: 20,
            offset: 0,
            sortBy: 'relevance',
            sortOrder: 'desc',
            ...options
          }
        }
      });

      if (searchError) throw searchError;

      const searchResults: SearchResult[] = data.results || [];
      
      setResults(searchResults);
      setTotalResults(data.totalCount || 0);
      
      // Mettre en cache
      cache.set(cacheKey, searchResults, { ttl: 5 * 60 * 1000 }); // 5 minutes

      // Ajouter à l'historique
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)];
        return newHistory.slice(0, 10); // Garder 10 dernières recherches
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche');
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const searchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('search-suggestions', {
        body: { query: query.trim() }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Erreur suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  }, []);

  const quickSearch = useCallback(async (category: string) => {
    return search('', { category }, { limit: 10, sortBy: 'popularity' });
  }, [search]);

  const searchByTags = useCallback(async (tags: string[]) => {
    return search('', { tags }, { limit: 20, sortBy: 'relevance' });
  }, [search]);

  const searchSimilar = useCallback(async (itemId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('similar-search', {
        body: { itemId }
      });

      if (error) throw error;

      return data.results || [];
    } catch (error) {
      console.error('Erreur recherche similaire:', error);
      return [];
    }
  }, []);

  const getPopularSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('popular-searches', {
        body: { limit: 10 }
      });

      if (error) throw error;

      return data.searches || [];
    } catch (error) {
      console.error('Erreur recherches populaires:', error);
      return [];
    }
  }, []);

  // Recherche en temps réel avec debounce
  const realtimeSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (query: string, filters?: SearchFilters, options?: SearchOptions) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (query.trim()) {
          search(query, filters, options);
        }
      }, 300);
    };
  }, [search]);

  // Charger l'historique depuis localStorage
  useState(() => {
    const savedHistory = localStorage.getItem('search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  });

  // Sauvegarder l'historique
  useState(() => {
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
  });

  return {
    results,
    loading,
    error,
    totalResults,
    searchHistory,
    suggestions,
    search,
    realtimeSearch,
    searchSuggestions,
    clearHistory,
    removeFromHistory,
    quickSearch,
    searchByTags,
    searchSimilar,
    getPopularSearches
  };
}