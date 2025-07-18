export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT'
}

interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ipAddress: string
  userAgent: string
  endpoint: string
  payload?: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

export class SecurityLogger {
  private supabase: any
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }
  
  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }
    
    try {
      // Log en base de données
      await this.supabase
        .from('security_events')
        .insert(securityEvent)
      
      // Log console pour debug
      console.warn('Security Event:', securityEvent)
      
      // Alertes pour événements critiques
      if (event.severity === 'critical') {
        await this.sendSecurityAlert(securityEvent)
      }
      
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }
  
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Envoyer notification d'alerte (email, Slack, etc.)
    // Pour l'instant, juste log
    console.error('CRITICAL SECURITY EVENT:', event)
  }
  
  async getSecurityMetrics(hours: number = 24): Promise<any> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    try {
      const { data, error } = await this.supabase
        .from('security_events')
        .select('type, severity, count(*)')
        .gte('timestamp', since)
        .group('type, severity')
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Failed to get security metrics:', error)
      return []
    }
  }
}

// Détection d'activité suspecte
export const detectSuspiciousActivity = (req: Request): boolean => {
  const userAgent = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''
  
  // Patterns suspects
  const suspiciousPatterns = [
    /bot|crawler|spider/i,
    /nikto|sqlmap|burp|nessus/i,
    /script|javascript|vbscript/i
  ]
  
  return suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(referer)
  )
}
