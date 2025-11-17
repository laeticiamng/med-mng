import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  globalSearch,
  searchPosts,
  searchUsers,
  searchTeams,
  searchWellness,
  getSearchSuggestions,
  getSearchHistory,
  getTrendingSearches,
  getRecentSearches,
  getPopularSearches,
  logSearch,
  logSearchResultClick,
  deleteSearchHistoryItem,
  clearSearchHistory,
  SearchResult,
  PostSearchResult,
  UserSearchResult,
  TeamSearchResult,
  SearchSuggestion,
  SearchHistory,
  SearchFilters,
} from '@shared/services/search.service'

// Global search hook
export function useGlobalSearch(query: string, limit: number = 50) {
  return useQuery({
    queryKey: ['search', 'global', query],
    queryFn: () => globalSearch(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Post search hook with filters
export function useSearchPosts(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['search', 'posts', query, filters],
    queryFn: () => searchPosts(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

// User search hook
export function useSearchUsers(query: string, limit: number = 50) {
  return useQuery({
    queryKey: ['search', 'users', query],
    queryFn: () => searchUsers(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

// Team search hook
export function useSearchTeams(query: string, limit: number = 50) {
  return useQuery({
    queryKey: ['search', 'teams', query],
    queryFn: () => searchTeams(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

// Wellness search hook
export function useSearchWellness(query: string, limit: number = 50) {
  return useQuery({
    queryKey: ['search', 'wellness', query],
    queryFn: () => searchWellness(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

// Search suggestions hook
export function useSearchSuggestions(limit: number = 10, suggestionType?: 'trending' | 'recent' | 'popular') {
  return useQuery({
    queryKey: ['search', 'suggestions', suggestionType],
    queryFn: () => getSearchSuggestions(limit, suggestionType),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Trending searches hook
export function useTrendingSearches(limit: number = 10) {
  return useQuery({
    queryKey: ['search', 'trending'],
    queryFn: () => getTrendingSearches(limit),
    staleTime: 1000 * 60 * 10,
  })
}

// Recent searches hook
export function useRecentSearches(limit: number = 5) {
  return useQuery({
    queryKey: ['search', 'recent'],
    queryFn: () => getRecentSearches(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Popular searches hook
export function usePopularSearches(days: number = 7, limit: number = 10) {
  return useQuery({
    queryKey: ['search', 'popular', days],
    queryFn: () => getPopularSearches(days, limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Search history hook
export function useFetchSearchHistory(limit: number = 20) {
  return useQuery({
    queryKey: ['search', 'history'],
    queryFn: () => getSearchHistory(limit),
    staleTime: 1000 * 60 * 2,
  })
}

// Log search mutation
export function useLogSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      query,
      searchType,
      resultsCount,
      filters,
    }: {
      query: string
      searchType: string
      resultsCount: number
      filters?: Record<string, any>
    }) => logSearch(query, searchType, resultsCount, filters),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['search', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['search', 'suggestions'] })
    },
  })
}

// Log search result click mutation
export function useLogSearchResultClick() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      searchHistoryId,
      resultId,
      resultType,
    }: {
      searchHistoryId: string
      resultId: string
      resultType: string
    }) => logSearchResultClick(searchHistoryId, resultId, resultType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'history'] })
    },
  })
}

// Delete search history item mutation
export function useDeleteSearchHistoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (historyId: string) => deleteSearchHistoryItem(historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'history'] })
    },
  })
}

// Clear search history mutation
export function useClearSearchHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'history'] })
    },
  })
}

// Combined search hook (searches multiple types at once)
export function useMultiTypeSearch(query: string) {
  const globalResults = useGlobalSearch(query, 20)
  const isLoading = globalResults.isLoading
  const isError = globalResults.isError

  return {
    data: globalResults.data || [],
    isLoading,
    isError,
    error: globalResults.error,
  }
}

// Search with pagination
export function usePaginatedSearch(query: string, pageSize: number = 50) {
  const queryClient = useQueryClient()

  const execute = async (pageIndex: number) => {
    const offset = pageIndex * pageSize
    return globalSearch(query, pageSize, offset)
  }

  return {
    execute,
    queryClient,
  }
}