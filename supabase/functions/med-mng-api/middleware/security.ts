import { log } from '../logger.ts';
import { errorResponse } from '../response.ts';

export class SecurityService {
  private static suspiciousIPs = new Set<string>();
  private static blockedIPs = new Set<string>();
  private static requestCounts = new Map<string, { count: number; window: number }>();

  static checkSecurityThreats(req: Request, ip: string): Response | null {
    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      log('warn', `Blocked IP attempted access: ${ip}`);
      return errorResponse(403, 'ACCESS_DENIED', 'Access denied');
    }

    // Check for suspicious patterns
    if (this.detectSuspiciousActivity(req, ip)) {
      this.markSuspicious(ip);
      return errorResponse(429, 'SUSPICIOUS_ACTIVITY', 'Suspicious activity detected');
    }

    return null;
  }

  private static detectSuspiciousActivity(req: Request, ip: string): boolean {
    const userAgent = req.headers.get('user-agent') || '';
    
    // Check for bot patterns
    // NOTE CISO: This list intentionally blocks common automation user-agents
    // (curl, python-requests, wget) to deter basic scraping. This may also
    // block legitimate monitoring tools — whitelist them at the infrastructure
    // level (e.g. reverse proxy) if needed.
    const suspiciousBots = [
      'bot', 'crawler', 'spider', 'scraper', 'scanner',
      'python-requests', 'curl', 'wget'
    ];
    
    if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
      return true;
    }

    // Check request frequency per IP
    const now = Date.now();
    const key = ip;
    const entry = this.requestCounts.get(key);
    
    if (entry && now - entry.window < 60000) { // 1 minute window
      if (entry.count > 100) { // More than 100 requests per minute
        return true;
      }
      entry.count++;
    } else {
      this.requestCounts.set(key, { count: 1, window: now });
    }

    return false;
  }

  private static markSuspicious(ip: string): void {
    this.suspiciousIPs.add(ip);
    log('warn', `IP marked as suspicious: ${ip}`);
    
    // Auto-block after multiple suspicious activities
    if (this.suspiciousIPs.size > 10) {
      this.blockedIPs.add(ip);
      log('error', `IP auto-blocked: ${ip}`);
    }
  }

  static validateContentType(req: Request): Response | null {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return errorResponse(400, 'INVALID_CONTENT_TYPE', 'Content-Type must be application/json');
      }
    }
    return null;
  }

  static sanitizeHeaders(req: Request): Record<string, string> {
    const allowedHeaders = [
      'authorization', 'content-type', 'user-agent',
      'x-forwarded-for', 'x-real-ip', 'x-client-info'
    ];
    
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of req.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        sanitized[key] = value.slice(0, 1000); // Limit header length
      }
    }
    
    return sanitized;
  }

  static getSecurityMetrics() {
    return {
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: this.blockedIPs.size,
      activeRequests: this.requestCounts.size
    };
  }
}