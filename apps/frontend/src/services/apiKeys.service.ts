import { supabase } from '@/integrations/supabase/client'

export interface ApiKey {
  id: string
  user_id: string
  name: string
  key_prefix: string
  description?: string
  last_used_at?: string
  expires_at?: string
  is_active: boolean
  scopes: string[]
  rate_limit: number
  created_at: string
  updated_at: string
}

export interface ApiUsageLog {
  id: string
  api_key_id: string
  endpoint: string
  method: string
  status_code?: number
  created_at: string
}

export interface CreateApiKeyParams {
  name: string
  description?: string
  scopes?: string[]
  rate_limit?: number
  expires_in_days?: number
}

// Generate secure API key
function generateApiKey(prefix: string): { fullKey: string; keyPrefix: string } {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const keySecret = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  const fullKey = `${prefix}_${keySecret}`
  const keyPrefix = `${prefix}_${keySecret.substring(0, 8)}`

  return { fullKey, keyPrefix }
}

// Hash API key for storage
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hash))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get user's API keys
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Create new API key
export async function createApiKey(
  userId: string,
  params: CreateApiKeyParams
): Promise<{ apiKey: ApiKey; fullKey: string }> {
  // Generate API key
  const { fullKey, keyPrefix } = generateApiKey('mk_live')
  const keyHash = await hashApiKey(fullKey)

  // Calculate expiration date
  const expiresAt = params.expires_in_days
    ? new Date(Date.now() + params.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    : null

  // Insert into database
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: params.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      description: params.description,
      scopes: params.scopes || ['read', 'write'],
      rate_limit: params.rate_limit || 1000,
      expires_at: expiresAt,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  return { apiKey: data, fullKey }
}

// Update API key
export async function updateApiKey(
  keyId: string,
  updates: Partial<Pick<ApiKey, 'name' | 'description' | 'scopes' | 'rate_limit' | 'is_active'>>
): Promise<ApiKey> {
  const { data, error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', keyId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Regenerate API key
export async function regenerateApiKey(keyId: string): Promise<{ apiKey: ApiKey; fullKey: string }> {
  // Get existing key
  const { data: existingKey, error: fetchError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .single()

  if (fetchError) throw fetchError

  // Generate new key
  const { fullKey, keyPrefix } = generateApiKey('mk_live')
  const keyHash = await hashApiKey(fullKey)

  // Update in database
  const { data, error } = await supabase
    .from('api_keys')
    .update({
      key_prefix: keyPrefix,
      key_hash: keyHash,
      last_used_at: null,
    })
    .eq('id', keyId)
    .select()
    .single()

  if (error) throw error

  return { apiKey: data, fullKey }
}

// Delete API key
export async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)

  if (error) throw error
}

// Get API key usage logs
export async function getApiKeyUsage(keyId: string, limit: number = 100): Promise<ApiUsageLog[]> {
  const { data, error } = await supabase
    .from('api_usage_logs')
    .select('*')
    .eq('api_key_id', keyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Get usage statistics
export async function getApiKeyStats(keyId: string): Promise<{
  total_requests: number
  requests_today: number
  avg_response_time: number
  error_rate: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('api_usage_logs')
    .select('status_code, response_time_ms, created_at')
    .eq('api_key_id', keyId)

  if (error) throw error

  const logs = data || []
  const todayLogs = logs.filter(log => new Date(log.created_at) >= today)
  const errors = logs.filter(log => log.status_code && log.status_code >= 400)
  const responseTimes = logs
    .filter(log => log.response_time_ms)
    .map(log => log.response_time_ms)

  return {
    total_requests: logs.length,
    requests_today: todayLogs.length,
    avg_response_time: responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0,
    error_rate: logs.length > 0 ? (errors.length / logs.length) * 100 : 0,
  }
}
