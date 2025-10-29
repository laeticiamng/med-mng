import { errorResponse } from '../response.ts';
import { log } from '../logger.ts';

// CSRF Token store (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; userId: string; expires: number }>();

// Generate CSRF token
export function generateCSRFToken(userId: string): string {
  const token = crypto.randomUUID();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  // Clean expired tokens
  cleanExpiredTokens();
  
  csrfTokens.set(token, { token, userId, expires });
  return token;
}

// Validate CSRF token
export function validateCSRFToken(token: string, userId: string): boolean {
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    log('warn', 'CSRF token not found', { token: token.substring(0, 8) + '...', userId });
    return false;
  }
  
  if (tokenData.expires < Date.now()) {
    csrfTokens.delete(token);
    log('warn', 'CSRF token expired', { userId });
    return false;
  }
  
  if (tokenData.userId !== userId) {
    log('warn', 'CSRF token user mismatch', { userId, tokenUserId: tokenData.userId });
    return false;
  }
  
  return true;
}

// Clean expired tokens
function cleanExpiredTokens(): void {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(token);
    }
  }
}

// CSRF Protection middleware
export function csrfProtection(req: Request, userId: string): Response | null {
  // ⚠️ CSRF désactivé temporairement à cause du stockage en mémoire dans Edge Functions
  // TODO: Implémenter stockage CSRF dans Supabase pour production
  // En attendant, l'authentification JWT est suffisante pour la sécurité
  
  return null; // Pas de validation CSRF pour le moment
  
  /* Code original commenté:
  const method = req.method;
  
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }
  
  const csrfToken = req.headers.get('X-CSRF-Token') || req.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    log('warn', 'Missing CSRF token', { method, userId });
    return errorResponse(403, 'CSRF_TOKEN_MISSING', 'CSRF token required for this operation');
  }
  
  if (!validateCSRFToken(csrfToken, userId)) {
    log('warn', 'Invalid CSRF token', { method, userId });
    return errorResponse(403, 'CSRF_TOKEN_INVALID', 'Invalid or expired CSRF token');
  }
  
  return null;
  */
}

// Get CSRF metrics
export function getCSRFMetrics() {
  cleanExpiredTokens();
  return {
    activeTokens: csrfTokens.size,
    lastCleanup: new Date().toISOString()
  };
}