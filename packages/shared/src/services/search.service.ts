import { supabase } from '../lib/supabase'

export interface ServiceSearchResult {
  id: string
  title: string
  content: string
  type: 'post' | 'user' | 'team' | 'wellness'
  createdAt: string
  relevance: number
}

export interface PostServiceSearchResult extends ServiceSearchResult {
  type: 'post'
  category?: string
  authorId: string
  commentCount: number
}

export interface UserServiceSearchResult extends ServiceSearchResult {
  type: 'user'
  username: string
  bio?: string
  avatarUrl?: string
}

export interface TeamServiceSearchResult extends ServiceSearchResult {
  type: 'team'
  description?: string
  visibility: string
}

export interface WellnessServiceSearchResult extends ServiceSearchResult {
  type: 'wellness'
  activityType: string
  userId: string
}

export interface SearchSuggestion {
  id: string
  query: string
  searchCount: number
  suggestionType: 'trending' | 'recent' | 'popular'
  category?: string
  lastSearched: string
}

export interface SearchHistory {
  id: string
  userId: string
  query: string
  searchType: string
  filters?: Record<string, any>
  resultsCount: number
  clickedResultId?: string
  clickedResultType?: string
  createdAt: string
}

export interface ServiceSearchFilters {
  category?: string
  startDate?: Date
  endDate?: Date
  type?: 'post' | 'user' | 'team' | 'wellness'
  limit?: number
  offset?: number
}

// Global search across all content types
export async function globalSearch(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<ServiceSearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  try {
    const { data, error } = await supabase
      .rpc('global_search', {
        p_query: query.trim(),
        p_limit: limit,
        p_offset: offset,
      })

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      createdAt: item.created_at,
      relevance: item.relevance,
    }))
  } catch (error) {
    console.error('Global search error:', error)
    throw error
  }
}

// Search posts with advanced filters
export async function searchPosts(
  query: string,
  filters?: ServiceSearchFilters
): Promise<PostServiceSearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  try {
    const { data, error } = await supabase
      .rpc('search_posts', {
        p_query: query.trim(),
        p_category: filters?.category || null,
        p_start_date: filters?.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        p_end_date: filters?.endDate ? filters.endDate.toISOString().split('T')[0] : null,
        p_limit: filters?.limit || 50,
        p_offset: filters?.offset || 0,
      })

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: 'post' as const,
      category: item.category,
      authorId: item.author_id,
      commentCount: item.comment_count || 0,
      createdAt: item.created_at,
      relevance: item.relevance,
    }))
  } catch (error) {
    console.error('Post search error:', error)
    throw error
  }
}

// Search users
export async function searchUsers(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserServiceSearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  try {
    const { data, error } = await supabase
      .rpc('search_users', {
        p_query: query.trim(),
        p_limit: limit,
        p_offset: offset,
      })

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.username,
      content: item.bio || '',
      type: 'user' as const,
      username: item.username,
      bio: item.bio,
      avatarUrl: item.avatar_url,
      createdAt: item.created_at,
      relevance: item.relevance,
    }))
  } catch (error) {
    console.error('User search error:', error)
    throw error
  }
}

// Search teams from global search (only public and internal)
export async function searchTeamsGlobal(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<TeamServiceSearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  try {
    const cleanQuery = query.trim()
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, description, visibility, created_at')
      .or(
        `name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`
      )
      .in('visibility', ['public', 'internal'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      content: item.description || '',
      type: 'team' as const,
      description: item.description,
      visibility: item.visibility,
      createdAt: item.created_at,
      relevance: 1,
    }))
  } catch (error) {
    console.error('Team search error:', error)
    throw error
  }
}

// Search wellness entries
export async function searchWellness(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<WellnessServiceSearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty')
  }

  try {
    const cleanQuery = query.trim()
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('id, activity_type, notes, user_id, created_at')
      .or(
        `activity_type.ilike.%${cleanQuery}%,notes.ilike.%${cleanQuery}%`
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.activity_type,
      content: item.notes || '',
      type: 'wellness' as const,
      activityType: item.activity_type,
      userId: item.user_id,
      createdAt: item.created_at,
      relevance: 1,
    }))
  } catch (error) {
    console.error('Wellness search error:', error)
    throw error
  }
}

// Get search suggestions (trending/popular)
export async function getSearchSuggestions(
  limit: number = 10,
  suggestionType?: 'trending' | 'recent' | 'popular'
): Promise<SearchSuggestion[]> {
  try {
    let query = supabase
      .from('search_suggestions')
      .select('*')

    if (suggestionType) {
      query = query.eq('suggestion_type', suggestionType)
    }

    const { data, error } = await query
      .order('search_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      query: item.query,
      searchCount: item.search_count,
      suggestionType: item.suggestion_type,
      category: item.category,
      lastSearched: item.last_searched,
    }))
  } catch (error) {
    console.error('Get search suggestions error:', error)
    throw error
  }
}

// Get search history for current user
export async function getSearchHistory(
  limit: number = 20,
  offset: number = 0
): Promise<SearchHistory[]> {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      query: item.query,
      searchType: item.search_type,
      filters: item.filters,
      resultsCount: item.results_count,
      clickedResultId: item.clicked_result_id,
      clickedResultType: item.clicked_result_type,
      createdAt: item.created_at,
    }))
  } catch (error) {
    console.error('Get search history error:', error)
    throw error
  }
}

// Clear search history
export async function clearSearchHistory(): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) throw error
  } catch (error) {
    console.error('Clear search history error:', error)
    throw error
  }
}

// Delete specific search history item
export async function deleteSearchHistoryItem(historyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', historyId)

    if (error) throw error
  } catch (error) {
    console.error('Delete search history item error:', error)
    throw error
  }
}

// Log a search (save to search_history)
export async function logSearch(
  query: string,
  searchType: string,
  resultsCount: number,
  filters?: Record<string, any>
): Promise<SearchHistory> {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        query,
        search_type: searchType,
        results_count: resultsCount,
        filters: filters || null,
      })
      .select()
      .single()

    if (error) throw error

    // Also update search suggestions
    await updateSearchSuggestion(query)

    return {
      id: data.id,
      userId: data.user_id,
      query: data.query,
      searchType: data.search_type,
      filters: data.filters,
      resultsCount: data.results_count,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Log search error:', error)
    throw error
  }
}

// Log search result click (for analytics)
export async function logSearchResultClick(
  searchHistoryId: string,
  resultId: string,
  resultType: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_history')
      .update({
        clicked_result_id: resultId,
        clicked_result_type: resultType,
      })
      .eq('id', searchHistoryId)

    if (error) throw error
  } catch (error) {
    console.error('Log search result click error:', error)
    throw error
  }
}

// Update search suggestion popularity
async function updateSearchSuggestion(query: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('update_search_suggestion', {
        p_query: query.toLowerCase(),
        p_category: null,
      })

    if (error) throw error
  } catch (error) {
    console.error('Update search suggestion error:', error)
  }
}

// Get trending searches
export async function getTrendingSearches(limit: number = 10): Promise<SearchSuggestion[]> {
  return getSearchSuggestions(limit, 'trending')
}

// Get recent searches from user history
export async function getRecentSearches(limit: number = 5): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map((item) => item.query) || []
  } catch (error) {
    console.error('Get recent searches error:', error)
    throw error
  }
}

// Search analytics - get popular searches
export async function getPopularSearches(
  days: number = 7,
  limit: number = 10
): Promise<SearchSuggestion[]> {
  try {
    const { data, error } = await supabase
      .from('search_suggestions')
      .select('*')
      .gte('last_searched', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('search_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      query: item.query,
      searchCount: item.search_count,
      suggestionType: item.suggestion_type,
      category: item.category,
      lastSearched: item.last_searched,
    }))
  } catch (error) {
    console.error('Get popular searches error:', error)
    throw error
  }
}

// Search with pagination cursor (for better performance with large datasets)
export async function searchWithCursor(
  query: string,
  limit: number = 50,
  cursor?: string
): Promise<{ results: ServiceSearchResult[]; nextCursor?: string }> {
  try {
    let dbQuery = supabase
      .from('posts')
      .select('id, title, content, created_at')
      .ilike('title', `%${query}%`)

    if (cursor) {
      dbQuery = dbQuery.lt('created_at', cursor)
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (error) throw error

    const hasMore = data!.length > limit
    const results = hasMore ? data!.slice(0, limit) : data!

    return {
      results: results.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content || '',
        type: 'post' as const,
        createdAt: item.created_at,
        relevance: 1,
      })),
      nextCursor: hasMore ? results[results.length - 1].created_at : undefined,
    }
  } catch (error) {
    console.error('Search with cursor error:', error)
    throw error
  }
}

// Type exports are handled by the package barrel exports
// Use ServiceSearchResult, PostServiceSearchResult, etc. when importing
