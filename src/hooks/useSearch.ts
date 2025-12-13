import { useState, useCallback, useMemo, useEffect } from 'react';
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

  const clearHistory = useCallback(async () => {
    setSearchHistory([]);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_search_history').delete().eq('user_id', user.id);
    }
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

  // Load search history from Supabase
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await (supabase as any)
          .from('user_search_history')
          .select('query')
          .eq('user_id', user.id)
          .order('searched_at', { ascending: false })
          .limit(50);
        if (data) {
          setSearchHistory(data.map((d: any) => d.query));
        }
      }
    };
    loadHistory();
  }, []);

  // Save history on change to Supabase
  useEffect(() => {
    const saveHistory = async () => {
      if (searchHistory.length === 0) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user && searchHistory.length > 0) {
        const latestQuery = searchHistory[searchHistory.length - 1];
        await (supabase as any).from('user_search_history').upsert({
          user_id: user.id,
          query: latestQuery,
          searched_at: new Date().toISOString()
        }, { onConflict: 'user_id,query' }).select();
      }
    };
    saveHistory();
  }, [searchHistory]);

  // Advanced filter search
  const searchWithFilters = useCallback(async (
    query: string,
    filters: SearchFilters
  ): Promise<SearchResult[]> => {
    await search(query, filters, { limit: 50, sortBy: 'relevance' });
    return results;
  }, [search, results]);

  // Search in specific category
  const searchInCategory = useCallback(async (
    query: string,
    category: string
  ): Promise<SearchResult[]> => {
    await search(query, { category }, { limit: 20 });
    return results;
  }, [search, results]);

  // Get search analytics
  const getSearchAnalytics = useCallback((): {
    totalSearches: number;
    uniqueQueries: number;
    averageResultsPerSearch: number;
    topCategories: string[];
  } => {
    const uniqueQueries = new Set(searchHistory).size;

    return {
      totalSearches: searchHistory.length,
      uniqueQueries,
      averageResultsPerSearch: results.length,
      topCategories: results.slice(0, 5).map(r => r.category)
    };
  }, [searchHistory, results]);

  // Highlight search terms in text
  const highlightSearchTerms = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    let highlighted = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });

    return highlighted;
  }, []);

  // Filter results locally
  const filterResults = useCallback((
    filterFn: (result: SearchResult) => boolean
  ): SearchResult[] => {
    return results.filter(filterFn);
  }, [results]);

  // Sort results
  const sortResults = useCallback((
    sortBy: 'relevance' | 'date' | 'rating' | 'title',
    order: 'asc' | 'desc' = 'desc'
  ): SearchResult[] => {
    const sorted = [...results];

    switch (sortBy) {
      case 'relevance':
        sorted.sort((a, b) => order === 'desc'
          ? b.relevanceScore - a.relevanceScore
          : a.relevanceScore - b.relevanceScore);
        break;
      case 'date':
        sorted.sort((a, b) => order === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating':
        sorted.sort((a, b) => order === 'desc'
          ? (b.rating || 0) - (a.rating || 0)
          : (a.rating || 0) - (b.rating || 0));
        break;
      case 'title':
        sorted.sort((a, b) => order === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title));
        break;
    }

    return sorted;
  }, [results]);

  // Get results grouped by category
  const getResultsByCategory = useCallback((): Record<string, SearchResult[]> => {
    return results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [results]);

  // Save search for later
  const saveSearch = useCallback(async (query: string, name?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_saved_searches').insert({
        user_id: user.id,
        query,
        name: name || query,
        saved_at: new Date().toISOString()
      });
    }
  }, []);

  // Get saved searches
  const getSavedSearches = useCallback(async (): Promise<{ query: string; name: string; savedAt: string }[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await (supabase as any)
      .from('user_saved_searches')
      .select('query, name, saved_at')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });
    return (data || []).map((s: any) => ({ query: s.query, name: s.name, savedAt: s.saved_at }));
  }, []);

  // Delete saved search
  const deleteSavedSearch = useCallback(async (query: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any)
        .from('user_saved_searches')
        .delete()
        .eq('user_id', user.id)
        .eq('query', query);
    }
  }, []);

  // Export search results
  const exportResults = useCallback((format: 'json' | 'csv' = 'json'): string => {
    if (format === 'csv') {
      const headers = 'Title,Category,Description,URL,Rating\n';
      const rows = results.map(r =>
        `"${r.title}","${r.category}","${r.description}","${r.url}",${r.rating || ''}`
      ).join('\n');
      return headers + rows;
    }

    return JSON.stringify(results, null, 2);
  }, [results]);

  // Get search stats
  const getSearchStats = useCallback(() => {
    const categories = new Map<string, number>();
    const ratings = { high: 0, medium: 0, low: 0 };

    results.forEach(r => {
      categories.set(r.category, (categories.get(r.category) || 0) + 1);
      if (r.rating) {
        if (r.rating >= 4) ratings.high++;
        else if (r.rating >= 2.5) ratings.medium++;
        else ratings.low++;
      }
    });

    return {
      totalResults: results.length,
      categories: Object.fromEntries(categories),
      ratingDistribution: ratings,
      averageRating: results.filter(r => r.rating)
        .reduce((sum, r) => sum + (r.rating || 0), 0) / results.filter(r => r.rating).length || 0
    };
  }, [results]);

  // Check if query matches any result
  const hasResults = useCallback((): boolean => {
    return results.length > 0;
  }, [results]);

  // Get result by ID
  const getResultById = useCallback((id: string): SearchResult | undefined => {
    return results.find(r => r.id === id);
  }, [results]);

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
    getPopularSearches,
    searchWithFilters,
    searchInCategory,
    getSearchAnalytics,
    highlightSearchTerms,
    filterResults,
    sortResults,
    getResultsByCategory,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    exportResults,
    getSearchStats,
    hasResults,
    getResultById
  };
}