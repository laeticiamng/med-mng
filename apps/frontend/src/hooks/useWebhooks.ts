import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookEvents,
  testWebhook,
  getWebhookStats,
  CreateWebhookParams,
  Webhook,
} from '@/services/webhooks.service'

// Get user's webhooks
export function useGetWebhooks(userId: string) {
  return useQuery({
    queryKey: ['webhooks', userId],
    queryFn: () => getUserWebhooks(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get single webhook
export function useGetWebhook(webhookId: string) {
  return useQuery({
    queryKey: ['webhooks', webhookId],
    queryFn: () => getWebhook(webhookId),
    enabled: !!webhookId,
    staleTime: 1000 * 60 * 2,
  })
}

// Create webhook
export function useCreateWebhook(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateWebhookParams) => createWebhook(userId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] })
    },
  })
}

// Update webhook
export function useUpdateWebhook(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ webhookId, updates }: { webhookId: string; updates: Partial<Webhook> }) =>
      updateWebhook(webhookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] })
    },
  })
}

// Delete webhook
export function useDeleteWebhook(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => deleteWebhook(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] })
    },
  })
}

// Get webhook events
export function useGetWebhookEvents(webhookId: string) {
  return useQuery({
    queryKey: ['webhook-events', webhookId],
    queryFn: () => getWebhookEvents(webhookId),
    enabled: !!webhookId,
    staleTime: 1000 * 60 * 2,
  })
}

// Test webhook
export function useTestWebhook(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => testWebhook(webhookId),
    onSuccess: (_, webhookId) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-events', webhookId] })
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] })
      queryClient.invalidateQueries({ queryKey: ['webhook-stats', webhookId] })
    },
  })
}

// Get webhook stats
export function useGetWebhookStats(webhookId: string) {
  return useQuery({
    queryKey: ['webhook-stats', webhookId],
    queryFn: () => getWebhookStats(webhookId),
    enabled: !!webhookId,
    staleTime: 1000 * 60 * 5,
  })
}
