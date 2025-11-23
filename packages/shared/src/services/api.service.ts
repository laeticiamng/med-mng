import { supabase } from '../lib/supabase'

export interface ApiKey {
  id: string
  userId: string
  name: string
  keyPrefix: string
  description?: string
  lastUsedAt?: string
  expiresAt?: string
  isActive: boolean
  scopes: string[]
  rateLimit: number
  createdAt: string
  updatedAt: string
}

export interface ApiUsageLog {
  id: string
  apiKeyId: string
  userId: string
  endpoint: string
  method: string
  statusCode?: number
  responseTimeMs?: number
  requestSize?: number
  responseSize?: number
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface Webhook {
  id: string
  userId: string
  name: string
  url: string
  events: string[]
  description?: string
  isActive: boolean
  secretToken?: string
  headers?: Record<string, string>
  retryPolicy: 'none' | 'fixed' | 'exponential'
  maxRetries: number
  timeoutSeconds: number
  lastTriggeredAt?: string
  lastSucceededAt?: string
  failureCount: number
  createdAt: string
  updatedAt: string
}

export interface WebhookEvent {
  id: string
  webhookId: string
  eventType: string
  payload: Record<string, any>
  status: 'pending' | 'sent' | 'failed' | 'success'
  responseStatusCode?: number
  responseBody?: string
  errorMessage?: string
  attempts: number
  nextRetryAt?: string
  createdAt: string
  updatedAt: string
}

export interface ApiDocumentation {
  id: string
  section: string
  title: string
  description?: string
  endpoint?: string
  method?: string
  requestExample?: Record<string, any>
  responseExample?: Record<string, any>
  statusCodes?: Record<number, string>
  errorExamples?: Record<string, any>
  rateLimit: number
  authenticationRequired: boolean
  version: string
  orderIndex?: number
  createdAt: string
  updatedAt: string
}

export interface ApiRateLimit {
  id: string
  apiKeyId: string
  requestsThisMinute: number
  requestsToday: number
  lastResetAt: string
  blockedUntil?: string
  createdAt: string
  updatedAt: string
}

// API Keys Management
export async function generateApiKey(
  name: string,
  description?: string,
  expiresAt?: Date,
  scopes?: string[]
): Promise<{ key: ApiKey; fullKey: string }> {
  try {
    // Generate a secure random key
    const fullKey = `pk_live_${generateRandomString(32)}`
    const keyPrefix = fullKey.substring(0, 20)
    // In production, this should be hashed using bcrypt or similar
    const keyHash = fullKey // Simplified for example

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        description,
        expires_at: expiresAt?.toISOString(),
        scopes: scopes || ['read', 'write'],
      })
      .select()
      .single()

    if (error) throw error

    return {
      key: mapApiKey(data),
      fullKey,
    }
  } catch (error) {
    console.error('Generate API key error:', error)
    throw error
  }
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapApiKey)
  } catch (error) {
    console.error('Get user API keys error:', error)
    throw error
  }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)

    if (error) throw error
  } catch (error) {
    console.error('Revoke API key error:', error)
    throw error
  }
}

export async function updateApiKey(
  keyId: string,
  updates: Partial<ApiKey>
): Promise<ApiKey> {
  try {
    const updateData: Record<string, any> = {}
    if (updates.name) updateData.name = updates.name
    if (updates.description) updateData.description = updates.description
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.scopes) updateData.scopes = updates.scopes
    if (updates.rateLimit) updateData.rate_limit = updates.rateLimit
    if (updates.expiresAt) updateData.expires_at = updates.expiresAt

    const { data, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', keyId)
      .select()
      .single()

    if (error) throw error
    return mapApiKey(data)
  } catch (error) {
    console.error('Update API key error:', error)
    throw error
  }
}

// API Usage Tracking
export async function getApiUsageLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ApiUsageLog[]> {
  try {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data || []).map(mapApiUsageLog)
  } catch (error) {
    console.error('Get API usage logs error:', error)
    throw error
  }
}

export async function logApiUsage(usageData: {
  apiKeyId: string
  userId: string
  endpoint: string
  method: string
  statusCode?: number
  responseTimeMs?: number
  errorMessage?: string
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('api_usage_logs')
      .insert({
        api_key_id: usageData.apiKeyId,
        user_id: usageData.userId,
        endpoint: usageData.endpoint,
        method: usageData.method,
        status_code: usageData.statusCode,
        response_time_ms: usageData.responseTimeMs,
        error_message: usageData.errorMessage,
      })

    if (error) throw error
  } catch (error) {
    console.error('Log API usage error:', error)
  }
}

// Webhooks Management
export async function createWebhook(webhookData: Partial<Webhook>): Promise<Webhook> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        description: webhookData.description,
        secret_token: generateRandomString(32),
        retry_policy: webhookData.retryPolicy || 'exponential',
        max_retries: webhookData.maxRetries || 3,
        timeout_seconds: webhookData.timeoutSeconds || 30,
      })
      .select()
      .single()

    if (error) throw error
    return mapWebhook(data)
  } catch (error) {
    console.error('Create webhook error:', error)
    throw error
  }
}

export async function getUserWebhooks(userId: string): Promise<Webhook[]> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapWebhook)
  } catch (error) {
    console.error('Get user webhooks error:', error)
    throw error
  }
}

export async function updateWebhook(
  webhookId: string,
  updates: Partial<Webhook>
): Promise<Webhook> {
  try {
    const updateData: Record<string, any> = {}
    if (updates.name) updateData.name = updates.name
    if (updates.url) updateData.url = updates.url
    if (updates.events) updateData.events = updates.events
    if (updates.description) updateData.description = updates.description
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.retryPolicy) updateData.retry_policy = updates.retryPolicy
    if (updates.maxRetries) updateData.max_retries = updates.maxRetries
    if (updates.timeoutSeconds) updateData.timeout_seconds = updates.timeoutSeconds

    const { data, error } = await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', webhookId)
      .select()
      .single()

    if (error) throw error
    return mapWebhook(data)
  } catch (error) {
    console.error('Update webhook error:', error)
    throw error
  }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)

    if (error) throw error
  } catch (error) {
    console.error('Delete webhook error:', error)
    throw error
  }
}

export async function testWebhook(webhookId: string): Promise<WebhookEvent> {
  try {
    // Create a test event
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        webhook_id: webhookId,
        event_type: 'test.event',
        payload: {
          test: true,
          timestamp: new Date().toISOString(),
          message: 'This is a test webhook event',
        },
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return mapWebhookEvent(data)
  } catch (error) {
    console.error('Test webhook error:', error)
    throw error
  }
}

// Webhook Events
export async function getWebhookEvents(
  webhookId: string,
  limit: number = 50
): Promise<WebhookEvent[]> {
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapWebhookEvent)
  } catch (error) {
    console.error('Get webhook events error:', error)
    throw error
  }
}

// API Documentation
export async function getApiDocumentation(section?: string): Promise<ApiDocumentation[]> {
  try {
    let query = supabase.from('api_documentation').select('*')

    if (section) {
      query = query.eq('section', section)
    }

    const { data, error } = await query.order('order_index', { ascending: true })

    if (error) throw error
    return (data || []).map(mapApiDocumentation)
  } catch (error) {
    console.error('Get API documentation error:', error)
    throw error
  }
}

// Helper functions
function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

function mapApiKey(data: any): ApiKey {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    keyPrefix: data.key_prefix,
    description: data.description,
    lastUsedAt: data.last_used_at,
    expiresAt: data.expires_at,
    isActive: data.is_active,
    scopes: data.scopes || [],
    rateLimit: data.rate_limit,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapApiUsageLog(data: any): ApiUsageLog {
  return {
    id: data.id,
    apiKeyId: data.api_key_id,
    userId: data.user_id,
    endpoint: data.endpoint,
    method: data.method,
    statusCode: data.status_code,
    responseTimeMs: data.response_time_ms,
    requestSize: data.request_size,
    responseSize: data.response_size,
    errorMessage: data.error_message,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    createdAt: data.created_at,
  }
}

function mapWebhook(data: any): Webhook {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    url: data.url,
    events: data.events || [],
    description: data.description,
    isActive: data.is_active,
    secretToken: data.secret_token,
    headers: data.headers || {},
    retryPolicy: data.retry_policy,
    maxRetries: data.max_retries,
    timeoutSeconds: data.timeout_seconds,
    lastTriggeredAt: data.last_triggered_at,
    lastSucceededAt: data.last_succeeded_at,
    failureCount: data.failure_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapWebhookEvent(data: any): WebhookEvent {
  return {
    id: data.id,
    webhookId: data.webhook_id,
    eventType: data.event_type,
    payload: data.payload || {},
    status: data.status,
    responseStatusCode: data.response_status_code,
    responseBody: data.response_body,
    errorMessage: data.error_message,
    attempts: data.attempts,
    nextRetryAt: data.next_retry_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapApiDocumentation(data: any): ApiDocumentation {
  return {
    id: data.id,
    section: data.section,
    title: data.title,
    description: data.description,
    endpoint: data.endpoint,
    method: data.method,
    requestExample: data.request_example,
    responseExample: data.response_example,
    statusCodes: data.status_codes,
    errorExamples: data.error_examples,
    rateLimit: data.rate_limit,
    authenticationRequired: data.authentication_required,
    version: data.version,
    orderIndex: data.order_index,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
