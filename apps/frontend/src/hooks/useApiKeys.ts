import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserApiKeys,
  createApiKey,
  updateApiKey,
  regenerateApiKey,
  deleteApiKey,
  getApiKeyUsage,
  getApiKeyStats,
  CreateApiKeyParams,
  ApiKey,
} from '@/services/apiKeys.service'

// Get user's API keys
export function useGetApiKeys(userId: string) {
  return useQuery({
    queryKey: ['api-keys', userId],
    queryFn: () => getUserApiKeys(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Create new API key
export function useCreateApiKey(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateApiKeyParams) => createApiKey(userId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', userId] })
    },
  })
}

// Update API key
export function useUpdateApiKey(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ keyId, updates }: { keyId: string; updates: Partial<ApiKey> }) =>
      updateApiKey(keyId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', userId] })
    },
  })
}

// Regenerate API key
export function useRegenerateApiKey(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (keyId: string) => regenerateApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', userId] })
    },
  })
}

// Delete API key
export function useDeleteApiKey(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (keyId: string) => deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', userId] })
    },
  })
}

// Get API key usage logs
export function useGetApiKeyUsage(keyId: string) {
  return useQuery({
    queryKey: ['api-key-usage', keyId],
    queryFn: () => getApiKeyUsage(keyId),
    enabled: !!keyId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Get API key stats
export function useGetApiKeyStats(keyId: string) {
  return useQuery({
    queryKey: ['api-key-stats', keyId],
    queryFn: () => getApiKeyStats(keyId),
    enabled: !!keyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
