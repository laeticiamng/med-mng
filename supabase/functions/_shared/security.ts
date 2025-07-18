// Headers de sécurité pour les Edge Functions
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "media-src 'self' https://api.suno.ai",
    "connect-src 'self' https://api.suno.ai https://*.supabase.co",
    "font-src 'self' https://cdnjs.cloudflare.com",
    "frame-ancestors 'none'",
    "form-action 'self'"
  ].join('; '),
  
  // Autres headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://med-mng.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

// Middleware de sécurité
export const withSecurity = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    // Vérifications de sécurité avant traitement
    const securityCheck = performSecurityChecks(req)
    if (!securityCheck.passed) {
      return new Response(
        JSON.stringify({ error: securityCheck.reason }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    try {
      const response = await handler(req)
      
      // Ajouter les headers de sécurité à la réponse
      const headers = new Headers(response.headers)
      Object.entries(securityHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
      
    } catch (error) {
      console.error('Handler error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

interface SecurityCheckResult {
  passed: boolean
  reason?: string
}

function performSecurityChecks(req: Request): SecurityCheckResult {
  const url = new URL(req.url)
  
  // Vérifier l'origine
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://med-mng.lovable.app',
    'https://preview--med-mng.lovable.app',
    'http://localhost:3000' // Pour le développement
  ]
  
  if (origin && !allowedOrigins.includes(origin)) {
    return { passed: false, reason: 'Origin not allowed' }
  }
  
  // Vérifier la taille du body
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB max
    return { passed: false, reason: 'Request too large' }
  }
  
  // Vérifier les headers suspects
  const userAgent = req.headers.get('user-agent')
  if (!userAgent || userAgent.length < 10) {
    return { passed: false, reason: 'Invalid user agent' }
  }
  
  return { passed: true }
}
