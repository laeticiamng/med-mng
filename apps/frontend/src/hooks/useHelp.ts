import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { helpService, HelpCategory, TutorialDifficulty, TicketPriority, TicketStatus } from '@/services/help.service'

const helpKeys = {
  all: ['help'] as const,
  featured: () => [...helpKeys.all, 'featured'] as const,
  articles: () => [...helpKeys.all, 'articles'] as const,
  articlesByCategory: (category: HelpCategory) => [...helpKeys.articles(), category] as const,
  articleBySlug: (slug: string) => [...helpKeys.articles(), 'slug', slug] as const,
  search: (query: string) => [...helpKeys.articles(), 'search', query] as const,
  faqs: () => [...helpKeys.all, 'faqs'] as const,
  faqsByCategory: (category: string) => [...helpKeys.faqs(), category] as const,
  tutorials: () => [...helpKeys.all, 'tutorials'] as const,
  tutorial: (id: string) => [...helpKeys.tutorials(), id] as const,
  tickets: () => [...helpKeys.all, 'tickets'] as const,
  ticket: (id: string) => [...helpKeys.tickets(), id] as const,
}

/**
 * Fetch featured help articles
 */
export function useFetchFeaturedArticles(limit = 6) {
  return useQuery({
    queryKey: [...helpKeys.featured(), limit],
    queryFn: () => helpService.getFeaturedArticles(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Fetch articles by category
 */
export function useFetchArticlesByCategory(category: HelpCategory, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...helpKeys.articlesByCategory(category), limit, offset],
    queryFn: () => helpService.getArticlesByCategory(category, limit, offset),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!category,
  })
}

/**
 * Fetch article by slug
 */
export function useFetchArticleBySlug(slug: string) {
  return useQuery({
    queryKey: helpKeys.articleBySlug(slug),
    queryFn: () => helpService.getArticleBySlug(slug),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!slug,
  })
}

/**
 * Search help articles
 */
export function useSearchArticles(query: string, enabled = false, limit = 20) {
  return useQuery({
    queryKey: [...helpKeys.search(query), limit],
    queryFn: () => helpService.searchArticles(query, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && query.length > 2,
  })
}

/**
 * Log search query
 */
export function useLogSearchQuery() {
  return useMutation({
    mutationFn: (params: { query: string; resultsCount?: number; clickedArticleId?: string }) =>
      helpService.logSearchQuery(params.query, params.resultsCount, params.clickedArticleId),
  })
}

/**
 * Fetch FAQs
 */
export function useFetchFAQs(category?: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: category ? [...helpKeys.faqsByCategory(category), limit, offset] : [...helpKeys.faqs(), limit, offset],
    queryFn: () => helpService.getFAQs(category, limit, offset),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

/**
 * Fetch tutorials
 */
export function useFetchTutorials(difficulty?: TutorialDifficulty, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...helpKeys.tutorials(), difficulty, limit, offset],
    queryFn: () => helpService.getTutorials(difficulty, limit, offset),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

/**
 * Fetch tutorial by ID
 */
export function useFetchTutorial(tutorialId: string) {
  return useQuery({
    queryKey: helpKeys.tutorial(tutorialId),
    queryFn: () => helpService.getTutorial(tutorialId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!tutorialId,
  })
}

/**
 * Submit help feedback
 */
export function useSubmitHelpFeedback() {
  return useMutation({
    mutationFn: (params: { articleId: string; isHelpful: boolean; feedbackText?: string }) =>
      helpService.submitFeedback(params.articleId, params.isHelpful, params.feedbackText),
  })
}

/**
 * Create support ticket
 */
export function useCreateSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { subject: string; description: string; category: string; priority?: TicketPriority }) =>
      helpService.createTicket(params.subject, params.description, params.category, params.priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpKeys.tickets() })
    },
  })
}

/**
 * Fetch user's support tickets
 */
export function useFetchSupportTickets(limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...helpKeys.tickets(), limit, offset],
    queryFn: () => helpService.getUserTickets(limit, offset),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Fetch support ticket by ID
 */
export function useFetchSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: helpKeys.ticket(ticketId),
    queryFn: () => helpService.getTicket(ticketId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!ticketId,
  })
}

/**
 * Update support ticket status
 */
export function useUpdateTicketStatus(ticketId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { status: TicketStatus; notes?: string }) =>
      helpService.updateTicketStatus(ticketId, params.status, params.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpKeys.ticket(ticketId) })
      queryClient.invalidateQueries({ queryKey: helpKeys.tickets() })
    },
  })
}
