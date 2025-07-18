import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
  blockDurationSeconds?: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'generate-song': {
    maxRequests: 3,
    windowSeconds: 300, // 5 minutes
    blockDurationSeconds: 600 // 10 minutes
  },
  'default': {
    maxRequests: 60,
    windowSeconds: 60 // 1 minute
  }
}

// Utiliser Supabase comme store pour le rate limiting
export class SupabaseRateLimiter {
  private supabase: any
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }
  
  async checkRateLimit(
    userId: string, 
    endpoint: string, 
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime?: number }> {
    
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default
    const key = `${endpoint}:${userId || ip}`
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - config.windowSeconds
    
    try {
      // Nettoyer les anciennes entrées
      await this.supabase
        .from('rate_limits')
        .delete()
        .lt('timestamp', windowStart)
      
      // Compter les requêtes dans la fenêtre
      const { data: requests, error } = await this.supabase
        .from('rate_limits')
        .select('timestamp')
        .eq('key', key)
        .gte('timestamp', windowStart)
        .order('timestamp', { ascending: false })
      
      if (error) throw error
      
      const requestCount = requests?.length || 0
      const remaining = Math.max(0, config.maxRequests - requestCount)
      
      if (requestCount >= config.maxRequests) {
        // Vérifier si bloqué
        const { data: blocked } = await this.supabase
          .from('rate_limit_blocks')
          .select('blocked_until')
          .eq('key', key)
          .single()
        
        if (blocked && blocked.blocked_until > now) {
          return { 
            allowed: false, 
            remaining: 0, 
            resetTime: blocked.blocked_until 
          }
        }
        
        // Créer un nouveau blocage si configuré
        if (config.blockDurationSeconds) {
          const blockedUntil = now + config.blockDurationSeconds
          await this.supabase
            .from('rate_limit_blocks')
            .upsert({
              key,
              blocked_until: blockedUntil,
              created_at: new Date().toISOString()
            })
          
          return { 
            allowed: false, 
            remaining: 0, 
            resetTime: blockedUntil 
          }
        }
        
        return { allowed: false, remaining: 0 }
      }
      
      return { allowed: true, remaining }
      
    } catch (error) {
      console.error('Rate limit check error:', error)
      // En cas d'erreur, autoriser la requête
      return { allowed: true, remaining: config.maxRequests }
    }
  }
  
  async recordRequest(userId: string, endpoint: string, ip: string): Promise<void> {
    const key = `${endpoint}:${userId || ip}`
    const now = Math.floor(Date.now() / 1000)
    
    try {
      await this.supabase
        .from('rate_limits')
        .insert({
          key,
          timestamp: now,
          user_id: userId,
          ip_address: ip,
          endpoint
        })
    } catch (error) {
      console.error('Rate limit record error:', error)
    }
  }
}

// Middleware rate limiting
export const withRateLimit = (endpoint: string) => {
  return (handler: (req: Request) => Promise<Response>) => {
    return async (req: Request): Promise<Response> => {
      const userId = req.headers.get('user-id') // Depuis l'auth
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      
      const rateLimiter = new SupabaseRateLimiter(supabaseClient)
      const result = await rateLimiter.checkRateLimit(userId, endpoint, ip)
      
      if (!result.allowed) {
        const resetTime = result.resetTime ? new Date(result.resetTime * 1000).toISOString() : undefined
        
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            remaining: result.remaining,
            resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': resetTime || '',
              'Retry-After': '300'
            }
          }
        )
      }
      
      // Enregistrer la requête
      await rateLimiter.recordRequest(userId, endpoint, ip)
      
      const response = await handler(req)
      
      // Ajouter les headers de rate limit
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      
      return response
    }
  }
}
