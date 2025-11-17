import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  generateApiKey,
  getUserApiKeys,
  revokeApiKey,
  updateApiKey,
  getApiUsageLogs,
  createWebhook,
  getUserWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookEvents,
  getApiDocumentation,
  ApiKey,
  Webhook,
  WebhookEvent,
  ApiDocumentation,
} from '@shared/services/api.service'

// API Keys
export function useFetchApiKeys(userId: string) {
  return useQuery({
    queryKey: ['api', 'keys', userId],
    queryFn: () => getUserApiKeys(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      name,
      description,
      expiresAt,
      scopes,
    }: {
      name: string
      description?: string
      expiresAt?: Date
      scopes?: string[]
    }) => generateApiKey(name, description, expiresAt, scopes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'keys'] })
    },
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (keyId: string) => revokeApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'keys'] })
    },
  })
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ keyId, updates }: { keyId: string; updates: Partial<ApiKey> }) =>
      updateApiKey(keyId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'keys'] })
    },
  })
}

// API Usage Logs
export function useFetchApiUsageLogs(userId: string, limit?: number) {
  return useQuery({
    queryKey: ['api', 'usage', userId],
    queryFn: () => getApiUsageLogs(userId, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

// Webhooks
export function useFetchWebhooks(userId: string) {
  return useQuery({
    queryKey: ['api', 'webhooks', userId],
    queryFn: () => getUserWebhooks(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (webhookData: Partial<Webhook>) => createWebhook(webhookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'webhooks'] })
    },
  })
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ webhookId, updates }: { webhookId: string; updates: Partial<Webhook> }) =>
      updateWebhook(webhookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'webhooks'] })
    },
  })
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (webhookId: string) => deleteWebhook(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'webhooks'] })
    },
  })
}

export function useTestWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (webhookId: string) => testWebhook(webhookId),
    onSuccess: (_, webhookId) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'webhook-events', webhookId] })
    },
  })
}

// Webhook Events
export function useFetchWebhookEvents(webhookId: string) {
  return useQuery({
    queryKey: ['api', 'webhook-events', webhookId],
    queryFn: () => getWebhookEvents(webhookId),
    enabled: !!webhookId,
    staleTime: 1000 * 60,
  })
}

// API Documentation
export function useFetchApiDocumentation(section?: string) {
  return useQuery({
    queryKey: ['api', 'documentation', section],
    queryFn: () => getApiDocumentation(section),
    staleTime: 1000 * 60 * 30,
  })
}
