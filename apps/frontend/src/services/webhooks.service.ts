import { supabase } from '@/integrations/supabase/client'

export interface Webhook {
  id: string
  user_id: string
  name: string
  url: string
  events: string[]
  description?: string
  is_active: boolean
  secret_token: string
  headers?: Record<string, string>
  retry_policy: 'none' | 'fixed' | 'exponential'
  max_retries: number
  timeout_seconds: number
  last_triggered_at?: string
  last_succeeded_at?: string
  failure_count: number
  created_at: string
  updated_at: string
}

export interface WebhookEvent {
  id: string
  webhook_id: string
  event_type: string
  payload: any
  status: 'pending' | 'sent' | 'failed' | 'success'
  response_status_code?: number
  response_body?: string
  error_message?: string
  attempts: number
  next_retry_at?: string
  created_at: string
  updated_at: string
}

export interface CreateWebhookParams {
  name: string
  url: string
  events: string[]
  description?: string
  headers?: Record<string, string>
  retry_policy?: 'none' | 'fixed' | 'exponential'
  max_retries?: number
  timeout_seconds?: number
}

// Available webhook events
export const AVAILABLE_EVENTS = [
  { value: 'event.created', label: 'Événement créé', description: 'Déclenché lors de la création d\'un événement' },
  { value: 'event.updated', label: 'Événement modifié', description: 'Déclenché lors de la modification d\'un événement' },
  { value: 'event.deleted', label: 'Événement supprimé', description: 'Déclenché lors de la suppression d\'un événement' },
  { value: 'user.created', label: 'Utilisateur créé', description: 'Déclenché lors de la création d\'un utilisateur' },
  { value: 'user.updated', label: 'Utilisateur modifié', description: 'Déclenché lors de la modification d\'un utilisateur' },
  { value: 'post.created', label: 'Post créé', description: 'Déclenché lors de la création d\'un post' },
  { value: 'post.updated', label: 'Post modifié', description: 'Déclenché lors de la modification d\'un post' },
  { value: 'comment.created', label: 'Commentaire créé', description: 'Déclenché lors de la création d\'un commentaire' },
]

// Generate secure webhook secret
function generateWebhookSecret(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  return 'whsec_' + Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get user's webhooks
export async function getUserWebhooks(userId: string): Promise<Webhook[]> {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get single webhook
export async function getWebhook(webhookId: string): Promise<Webhook> {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .single()

  if (error) throw error
  return data
}

// Create new webhook
export async function createWebhook(
  userId: string,
  params: CreateWebhookParams
): Promise<Webhook> {
  const secretToken = generateWebhookSecret()

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      user_id: userId,
      name: params.name,
      url: params.url,
      events: params.events,
      description: params.description,
      secret_token: secretToken,
      headers: params.headers || {},
      retry_policy: params.retry_policy || 'exponential',
      max_retries: params.max_retries || 3,
      timeout_seconds: params.timeout_seconds || 30,
      is_active: true,
      failure_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update webhook
export async function updateWebhook(
  webhookId: string,
  updates: Partial<Pick<Webhook, 'name' | 'url' | 'events' | 'description' | 'headers' | 'retry_policy' | 'max_retries' | 'timeout_seconds' | 'is_active'>>
): Promise<Webhook> {
  const { data, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', webhookId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete webhook
export async function deleteWebhook(webhookId: string): Promise<void> {
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId)

  if (error) throw error
}

// Get webhook events/logs
export async function getWebhookEvents(webhookId: string, limit: number = 50): Promise<WebhookEvent[]> {
  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Test webhook (send test event)
export async function testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get webhook details
    const webhook = await getWebhook(webhookId)

    // Create test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Med-Mng',
        webhook_id: webhookId,
      },
    }

    // Create HMAC signature
    const signature = await createWebhookSignature(testPayload, webhook.secret_token)

    // Send to webhook URL
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'Med-Mng-Webhooks/1.0',
        ...webhook.headers,
      },
      body: JSON.stringify(testPayload),
    })

    // Log the test event
    await supabase.from('webhook_events').insert({
      webhook_id: webhookId,
      event_type: 'webhook.test',
      payload: testPayload,
      status: response.ok ? 'success' : 'failed',
      response_status_code: response.status,
      response_body: await response.text().catch(() => null),
      attempts: 1,
    })

    // Update webhook stats
    await supabase
      .from('webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_succeeded_at: response.ok ? new Date().toISOString() : undefined,
        failure_count: response.ok ? 0 : webhook.failure_count + 1,
      })
      .eq('id', webhookId)

    return {
      success: response.ok,
      message: response.ok
        ? `Test réussi (${response.status})`
        : `Test échoué (${response.status})`,
    }
  } catch (error) {
    console.error('Webhook test error:', error)
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Create webhook signature for verification
async function createWebhookSignature(payload: any, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(payload))
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get webhook statistics
export async function getWebhookStats(webhookId: string): Promise<{
  total_events: number
  successful_events: number
  failed_events: number
  success_rate: number
  last_24h_events: number
}> {
  const { data, error } = await supabase
    .from('webhook_events')
    .select('status, created_at')
    .eq('webhook_id', webhookId)

  if (error) throw error

  const events = data || []
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const successful = events.filter(e => e.status === 'success').length
  const failed = events.filter(e => e.status === 'failed').length
  const last24h = events.filter(e => new Date(e.created_at) >= twentyFourHoursAgo).length

  return {
    total_events: events.length,
    successful_events: successful,
    failed_events: failed,
    success_rate: events.length > 0 ? (successful / events.length) * 100 : 0,
    last_24h_events: last24h,
  }
}
