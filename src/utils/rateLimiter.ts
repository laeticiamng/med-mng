interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  blockDurationMs?: number
}

interface RateLimitState {
  requests: number[]
  blockedUntil?: number
}

export class FrontendRateLimiter {
  private limits: Map<string, RateLimitState> = new Map()
  private config: Record<string, RateLimitConfig>

  constructor() {
    this.config = {
      // Génération musicale: 3 requêtes par 5 minutes
      'music-generation': {
        maxRequests: 3,
        windowMs: 5 * 60 * 1000,
        blockDurationMs: 10 * 60 * 1000 // Bloqué 10 minutes
      },
      
      // API générale: 60 requêtes par minute
      'api-general': {
        maxRequests: 60,
        windowMs: 60 * 1000
      },
      
      // Feedback: 5 par heure
      'feedback': {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000
      }
    }
  }

  canMakeRequest(endpoint: string, userId?: string): boolean {
    const key = `${endpoint}:${userId || 'anonymous'}`
    const config = this.config[endpoint]
    
    if (!config) return true // Pas de limite configurée
    
    const now = Date.now()
    let state = this.limits.get(key)
    
    if (!state) {
      state = { requests: [] }
      this.limits.set(key, state)
    }
    
    // Vérifier si encore bloqué
    if (state.blockedUntil && now < state.blockedUntil) {
      return false
    }
    
    // Nettoyer les requêtes anciennes
    state.requests = state.requests.filter(
      time => now - time < config.windowMs
    )
    
    // Vérifier la limite
    if (state.requests.length >= config.maxRequests) {
      // Bloquer si configuré
      if (config.blockDurationMs) {
        state.blockedUntil = now + config.blockDurationMs
      }
      return false
    }
    
    return true
  }
  
  recordRequest(endpoint: string, userId?: string): void {
    const key = `${endpoint}:${userId || 'anonymous'}`
    const state = this.limits.get(key)
    
    if (state) {
      state.requests.push(Date.now())
    }
  }
  
  getRemainingRequests(endpoint: string, userId?: string): number {
    const key = `${endpoint}:${userId || 'anonymous'}`
    const config = this.config[endpoint]
    const state = this.limits.get(key)
    
    if (!config || !state) return config?.maxRequests || Infinity
    
    const now = Date.now()
    const recentRequests = state.requests.filter(
      time => now - time < config.windowMs
    )
    
    return Math.max(0, config.maxRequests - recentRequests.length)
  }
  
  getBlockedUntil(endpoint: string, userId?: string): number | null {
    const key = `${endpoint}:${userId || 'anonymous'}`
    const state = this.limits.get(key)
    
    return state?.blockedUntil || null
  }
}

export const rateLimiter = new FrontendRateLimiter()
