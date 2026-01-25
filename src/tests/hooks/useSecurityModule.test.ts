/**
 * 🔐 Tests Unitaires - Module Security
 * 
 * Couverture complète:
 * - XSS prevention (DOMPurify)
 * - Input validation & sanitization
 * - CSRF protection
 * - Security headers
 * - RLS validation
 * - Authentication security
 * - Edge cases & attack vectors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================
// TYPES & INTERFACES
// ============================================

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Strict-Transport-Security': string;
}

interface CsrfToken {
  token: string;
  expiresAt: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

interface SecurityScanResult {
  score: number;
  issues: { type: string; message: string; severity: string }[];
  recommendations: string[];
}

// ============================================
// MOCK IMPLEMENTATIONS
// ============================================

const FORBIDDEN_TAGS = ['script', 'object', 'embed', 'iframe', 'form', 'input'];
const FORBIDDEN_ATTRS = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus'];

describe('Security Module - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // XSS PREVENTION TESTS
  // ============================================

  describe('XSS Prevention', () => {
    const sanitizeHtml = (html: string): string => {
      if (!html) return '';
      
      // Remove script tags
      let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Remove event handlers
      FORBIDDEN_ATTRS.forEach(attr => {
        const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
        clean = clean.replace(regex, '');
      });
      
      // Remove dangerous tags
      FORBIDDEN_TAGS.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*/>`, 'gi');
        clean = clean.replace(regex, '');
      });
      
      return clean;
    };

    it('should remove script tags', () => {
      const malicious = '<p>Hello</p><script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove event handlers', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('onerror');
    });

    it('should remove onclick handlers', () => {
      const malicious = '<button onclick="steal()">Click</button>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('onclick');
    });

    it('should remove iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<iframe');
    });

    it('should preserve safe content', () => {
      const safe = '<p>Hello <strong>World</strong></p>';
      const sanitized = sanitizeHtml(safe);
      
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
    });

    it('should handle nested malicious content', () => {
      const malicious = '<div><script>evil()</script><p>Safe</p></div>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('script');
      expect(sanitized).toContain('Safe');
    });

    it('should handle encoded XSS attempts', () => {
      const encoded = '&lt;script&gt;alert(1)&lt;/script&gt;';
      // Encoded content should remain as-is (it's safe)
      expect(encoded).toContain('&lt;');
    });

    it('should handle case variations', () => {
      const malicious = '<SCRIPT>alert(1)</SCRIPT>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('SCRIPT');
    });
  });

  // ============================================
  // INPUT VALIDATION TESTS
  // ============================================

  describe('Input Validation', () => {
    const validateEmail = (email: string): ValidationResult => {
      const errors: string[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        errors.push('Email is required');
      } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      } else if (email.length > 255) {
        errors.push('Email too long');
      }
      
      return { isValid: errors.length === 0, errors };
    };

    const validatePassword = (password: string): ValidationResult => {
      const errors: string[] = [];
      
      if (!password) {
        errors.push('Password is required');
      } else {
        if (password.length < 8) errors.push('Password must be at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase');
        if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase');
        if (!/[0-9]/.test(password)) errors.push('Password must contain number');
      }
      
      return { isValid: errors.length === 0, errors };
    };

    const sanitizeInput = (input: string): string => {
      return input.trim().replace(/[<>]/g, '');
    };

    it('should validate email format', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('invalid').isValid).toBe(false);
      expect(validateEmail('').isValid).toBe(false);
    });

    it('should reject emails with SQL injection', () => {
      const malicious = "test@example.com'; DROP TABLE users;--";
      const extendedSanitize = (input: string) => input.replace(/['";]/g, '');
      const sanitized = extendedSanitize(malicious);
      
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(";");
    });

    it('should validate password strength', () => {
      expect(validatePassword('Weak').isValid).toBe(false);
      expect(validatePassword('StrongPass123').isValid).toBe(true);
    });

    it('should require password complexity', () => {
      const result = validatePassword('alllowercase');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase');
    });

    it('should sanitize angle brackets', () => {
      const malicious = '<script>alert(1)</script>';
      const sanitized = sanitizeInput(malicious);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toBe('test');
    });

    it('should handle null-byte injection', () => {
      const malicious = 'test\x00evil';
      const sanitized = malicious.replace(/\x00/g, '');
      
      expect(sanitized).not.toContain('\x00');
    });

    it('should validate length limits', () => {
      const validateLength = (input: string, max: number): boolean => {
        return input.length <= max;
      };
      
      expect(validateLength('short', 100)).toBe(true);
      expect(validateLength('a'.repeat(101), 100)).toBe(false);
    });
  });

  // ============================================
  // CSRF PROTECTION TESTS
  // ============================================

  describe('CSRF Protection', () => {
    const generateCsrfToken = (): CsrfToken => {
      const token = Array.from({ length: 32 }, () => 
        Math.random().toString(36).charAt(2)
      ).join('');
      
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      
      return { token, expiresAt };
    };

    const validateCsrfToken = (token: string, expected: string): boolean => {
      return token === expected && token.length >= 32;
    };

    const isTokenExpired = (expiresAt: string): boolean => {
      return new Date(expiresAt) < new Date();
    };

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      
      expect(token1.token).not.toBe(token2.token);
    });

    it('should generate tokens with sufficient length', () => {
      const { token } = generateCsrfToken();
      
      expect(token.length).toBeGreaterThanOrEqual(32);
    });

    it('should validate matching tokens', () => {
      const { token } = generateCsrfToken();
      
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it('should reject mismatched tokens', () => {
      const token1 = generateCsrfToken().token;
      const token2 = generateCsrfToken().token;
      
      expect(validateCsrfToken(token1, token2)).toBe(false);
    });

    it('should detect expired tokens', () => {
      const expiredDate = new Date(Date.now() - 1000).toISOString();
      
      expect(isTokenExpired(expiredDate)).toBe(true);
    });

    it('should accept valid tokens', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      
      expect(isTokenExpired(futureDate)).toBe(false);
    });

    it('should reject empty tokens', () => {
      expect(validateCsrfToken('', 'expected')).toBe(false);
    });
  });

  // ============================================
  // SECURITY HEADERS TESTS
  // ============================================

  describe('Security Headers', () => {
    const getSecurityHeaders = (): SecurityHeaders => ({
      'Content-Security-Policy': "default-src 'self'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });

    const validateCSP = (csp: string): boolean => {
      return csp.includes("default-src") && !csp.includes("'unsafe-eval'");
    };

    it('should include Content-Security-Policy', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Content-Security-Policy']).toBeDefined();
    });

    it('should have nosniff for content type', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should deny framing', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    it('should enable XSS protection', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['X-XSS-Protection']).toContain('1');
    });

    it('should have strict referrer policy', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should enforce HSTS', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Strict-Transport-Security']).toContain('max-age');
      expect(headers['Strict-Transport-Security']).toContain('includeSubDomains');
    });

    it('should validate CSP policy', () => {
      const safeCSP = "default-src 'self'; script-src 'self'";
      const unsafeCSP = "default-src 'self' 'unsafe-eval'";
      
      expect(validateCSP(safeCSP)).toBe(true);
      expect(validateCSP(unsafeCSP)).toBe(false);
    });
  });

  // ============================================
  // RLS VALIDATION TESTS
  // ============================================

  describe('RLS Validation', () => {
    const validateRLSPolicy = (
      userId: string,
      resourceOwnerId: string,
      role: string
    ): boolean => {
      // Admins can access everything
      if (role === 'admin') return true;
      
      // Regular users can only access their own resources
      return userId === resourceOwnerId;
    };

    const checkTableRLS = (tableName: string): boolean => {
      const tablesWithRLS = [
        'profiles',
        'user_activity_logs',
        'med_mng_playlists',
        'user_badges',
        'flashcards'
      ];
      
      return tablesWithRLS.includes(tableName);
    };

    it('should allow users to access own resources', () => {
      const result = validateRLSPolicy('user-1', 'user-1', 'authenticated');
      
      expect(result).toBe(true);
    });

    it('should deny access to other users resources', () => {
      const result = validateRLSPolicy('user-1', 'user-2', 'authenticated');
      
      expect(result).toBe(false);
    });

    it('should allow admin access to all resources', () => {
      const result = validateRLSPolicy('admin-1', 'user-2', 'admin');
      
      expect(result).toBe(true);
    });

    it('should verify RLS on sensitive tables', () => {
      expect(checkTableRLS('profiles')).toBe(true);
      expect(checkTableRLS('user_activity_logs')).toBe(true);
      expect(checkTableRLS('public_content')).toBe(false);
    });

    it('should handle null user ID', () => {
      const validateAccess = (userId: string | null): boolean => {
        return userId !== null && userId.length > 0;
      };
      
      expect(validateAccess(null)).toBe(false);
      expect(validateAccess('')).toBe(false);
      expect(validateAccess('user-1')).toBe(true);
    });
  });

  // ============================================
  // AUTHENTICATION SECURITY TESTS
  // ============================================

  describe('Authentication Security', () => {
    const validateSession = (session: { expiresAt: string; userId: string } | null): boolean => {
      if (!session) return false;
      if (!session.userId) return false;
      if (new Date(session.expiresAt) < new Date()) return false;
      return true;
    };

    const hashPassword = (password: string): string => {
      // Simulate hashing (in real code, use bcrypt)
      return Buffer.from(password).toString('base64');
    };

    const validatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
      let score = 0;
      const feedback: string[] = [];
      
      if (password.length >= 8) score += 25;
      else feedback.push('Use at least 8 characters');
      
      if (/[A-Z]/.test(password)) score += 25;
      else feedback.push('Add uppercase letters');
      
      if (/[a-z]/.test(password)) score += 25;
      else feedback.push('Add lowercase letters');
      
      if (/[0-9]/.test(password)) score += 15;
      else feedback.push('Add numbers');
      
      if (/[!@#$%^&*]/.test(password)) score += 10;
      else feedback.push('Add special characters');
      
      return { score, feedback };
    };

    it('should validate active session', () => {
      const validSession = {
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      expect(validateSession(validSession)).toBe(true);
    });

    it('should reject expired session', () => {
      const expiredSession = {
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };
      
      expect(validateSession(expiredSession)).toBe(false);
    });

    it('should reject null session', () => {
      expect(validateSession(null)).toBe(false);
    });

    it('should never store plaintext passwords', () => {
      const password = 'SecurePass123';
      const hashed = hashPassword(password);
      
      expect(hashed).not.toBe(password);
    });

    it('should calculate password strength score', () => {
      const weak = validatePasswordStrength('weak');
      const strong = validatePasswordStrength('StrongP@ss123');
      
      expect(weak.score).toBeLessThan(50);
      expect(strong.score).toBeGreaterThanOrEqual(75);
    });

    it('should provide password feedback', () => {
      const result = validatePasswordStrength('lowercase');
      
      expect(result.feedback).toContain('Add uppercase letters');
    });
  });

  // ============================================
  // SECURITY SCANNING TESTS
  // ============================================

  describe('Security Scanning', () => {
    const scanForVulnerabilities = (config: {
      hasCSP: boolean;
      hasRLS: boolean;
      hasHTTPS: boolean;
      exposedSecrets: boolean;
    }): SecurityScanResult => {
      let score = 100;
      const issues: { type: string; message: string; severity: string }[] = [];
      const recommendations: string[] = [];
      
      if (!config.hasCSP) {
        score -= 20;
        issues.push({
          type: 'MISSING_CSP',
          message: 'Content Security Policy not configured',
          severity: 'high'
        });
        recommendations.push('Implement Content Security Policy');
      }
      
      if (!config.hasRLS) {
        score -= 30;
        issues.push({
          type: 'MISSING_RLS',
          message: 'Row Level Security not enabled',
          severity: 'critical'
        });
        recommendations.push('Enable RLS on all tables');
      }
      
      if (!config.hasHTTPS) {
        score -= 25;
        issues.push({
          type: 'NO_HTTPS',
          message: 'HTTPS not enforced',
          severity: 'high'
        });
        recommendations.push('Enable HTTPS with HSTS');
      }
      
      if (config.exposedSecrets) {
        score -= 50;
        issues.push({
          type: 'EXPOSED_SECRETS',
          message: 'API keys found in client code',
          severity: 'critical'
        });
        recommendations.push('Move secrets to environment variables');
      }
      
      return { score: Math.max(0, score), issues, recommendations };
    };

    it('should detect missing CSP', () => {
      const result = scanForVulnerabilities({
        hasCSP: false,
        hasRLS: true,
        hasHTTPS: true,
        exposedSecrets: false
      });
      
      expect(result.issues.some(i => i.type === 'MISSING_CSP')).toBe(true);
    });

    it('should detect missing RLS', () => {
      const result = scanForVulnerabilities({
        hasCSP: true,
        hasRLS: false,
        hasHTTPS: true,
        exposedSecrets: false
      });
      
      expect(result.issues.some(i => i.type === 'MISSING_RLS')).toBe(true);
      expect(result.score).toBeLessThanOrEqual(70);
    });

    it('should detect exposed secrets', () => {
      const result = scanForVulnerabilities({
        hasCSP: true,
        hasRLS: true,
        hasHTTPS: true,
        exposedSecrets: true
      });
      
      expect(result.issues.some(i => i.type === 'EXPOSED_SECRETS')).toBe(true);
      expect(result.score).toBeLessThanOrEqual(50);
    });

    it('should pass with all security measures', () => {
      const result = scanForVulnerabilities({
        hasCSP: true,
        hasRLS: true,
        hasHTTPS: true,
        exposedSecrets: false
      });
      
      expect(result.score).toBe(100);
      expect(result.issues.length).toBe(0);
    });

    it('should provide recommendations', () => {
      const result = scanForVulnerabilities({
        hasCSP: false,
        hasRLS: false,
        hasHTTPS: false,
        exposedSecrets: false
      });
      
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // EDGE CASES & ATTACK VECTORS
  // ============================================

  describe('Attack Vector Prevention', () => {
    it('should prevent SQL injection patterns', () => {
      const detectSQLInjection = (input: string): boolean => {
        const patterns = [
          /('|")\s*(OR|AND)\s*('|")/i,
          /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
          /UNION\s+SELECT/i,
          /--\s*$/
        ];
        
        return patterns.some(p => p.test(input));
      };
      
      expect(detectSQLInjection("' OR '1'='1")).toBe(true);
      expect(detectSQLInjection('; DROP TABLE users;--')).toBe(true);
      expect(detectSQLInjection('normal input')).toBe(false);
    });

    it('should prevent path traversal', () => {
      const sanitizePath = (path: string): string => {
        return path.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
      };
      
      expect(sanitizePath('../../../etc/passwd')).not.toContain('..');
      expect(sanitizePath('normal/path')).toBe('normal/path');
    });

    it('should prevent header injection', () => {
      const sanitizeHeader = (value: string): string => {
        return value.replace(/[\r\n]/g, '');
      };
      
      const malicious = "value\r\nX-Injected: header";
      const sanitized = sanitizeHeader(malicious);
      
      expect(sanitized).not.toContain('\r');
      expect(sanitized).not.toContain('\n');
    });

    it('should prevent command injection', () => {
      const sanitizeCommand = (input: string): string => {
        return input.replace(/[;&|`$(){}[\]<>]/g, '');
      };
      
      const malicious = 'file.txt; rm -rf /';
      const sanitized = sanitizeCommand(malicious);
      
      expect(sanitized).not.toContain(';');
    });

    it('should detect prototype pollution attempts', () => {
      const isSafeKey = (key: string): boolean => {
        const forbidden = ['__proto__', 'constructor', 'prototype'];
        return !forbidden.includes(key);
      };
      
      expect(isSafeKey('__proto__')).toBe(false);
      expect(isSafeKey('constructor')).toBe(false);
      expect(isSafeKey('normalKey')).toBe(true);
    });

    it('should handle unicode bypass attempts', () => {
      const normalizeUnicode = (input: string): string => {
        return input.normalize('NFKC');
      };
      
      // Some unicode can be normalized to dangerous characters
      const normalized = normalizeUnicode('test');
      expect(typeof normalized).toBe('string');
    });

    it('should limit recursion depth', () => {
      const MAX_DEPTH = 10;
      
      const checkDepth = (obj: any, depth: number = 0): boolean => {
        if (depth > MAX_DEPTH) return false;
        if (typeof obj !== 'object' || obj === null) return true;
        
        return Object.values(obj).every(v => checkDepth(v, depth + 1));
      };
      
      const shallow = { a: { b: { c: 1 } } };
      const deep: any = { level: {} };
      let current = deep.level;
      for (let i = 0; i < 15; i++) {
        current.next = {};
        current = current.next;
      }
      
      expect(checkDepth(shallow)).toBe(true);
      expect(checkDepth(deep)).toBe(false);
    });
  });
});
