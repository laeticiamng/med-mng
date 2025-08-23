import { Request } from 'express';
import { 
  analyzeSuspiciousRequest, 
  quickSuspiciousCheck, 
  sanitizeInput, 
  generateSecurityReport,
  ThreatType 
} from '@/utils/suspiciousRequest';

// Mock request helper
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    url: '/',
    method: 'GET',
    query: {},
    body: {},
    get: jest.fn(() => undefined),
    ip: '127.0.0.1',
    ...overrides
  } as any;
}

describe('Suspicious Request Analysis', () => {
  describe('analyzeSuspiciousRequest', () => {
    test('should detect XSS in URL', () => {
      const req = createMockRequest({
        url: '/search?q=<script>alert("xss")</script>'
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
      expect(result.threats).toHaveLength(1);
      expect(result.threats[0].type).toBe(ThreatType.XSS);
      expect(result.threats[0].location).toBe('url');
      expect(result.threats[0].severity).toBe('critical');
      expect(result.riskScore).toBeGreaterThan(70);
      expect(result.recommendation).toBe('block');
    });

    test('should detect SQL injection in query parameters', () => {
      const req = createMockRequest({
        url: '/users',
        query: {
          id: "1 OR 1=1",
          name: "'; DROP TABLE users; --"
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
      expect(result.threats.length).toBeGreaterThan(0);
      
      const sqlThreats = result.threats.filter(t => t.type === ThreatType.SQL_INJECTION);
      expect(sqlThreats.length).toBeGreaterThan(0);
      expect(sqlThreats.some(t => t.location === 'query')).toBe(true);
    });

    test('should detect path traversal in body', () => {
      const req = createMockRequest({
        url: '/upload',
        method: 'POST',
        body: {
          filename: '../../../etc/passwd',
          path: '..\\..\\windows\\system32\\config'
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
      
      const pathTraversalThreats = result.threats.filter(t => t.type === ThreatType.PATH_TRAVERSAL);
      expect(pathTraversalThreats.length).toBeGreaterThan(0);
      expect(pathTraversalThreats.some(t => t.location === 'body')).toBe(true);
    });

    test('should detect command injection patterns', () => {
      const req = createMockRequest({
        url: '/api/ping',
        query: {
          host: '127.0.0.1; cat /etc/passwd',
          cmd: '$(whoami)'
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
      
      const cmdInjectionThreats = result.threats.filter(t => t.type === ThreatType.COMMAND_INJECTION);
      expect(cmdInjectionThreats.length).toBeGreaterThan(0);
    });

    test('should detect suspicious User-Agent headers', () => {
      const req = createMockRequest({
        get: jest.fn((header: string) => {
          if (header === 'User-Agent') {
            return '<script>alert("xss")</script>';
          }
          return undefined;
        })
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
      expect(result.threats.some(t => t.location === 'headers')).toBe(true);
    });

    test('should handle nested objects in body', () => {
      const req = createMockRequest({
        body: {
          user: {
            profile: {
              bio: '<iframe src="javascript:alert(1)"></iframe>',
              settings: {
                theme: 'dark',
                malicious: 'eval(evil_code)'
              }
            }
          }
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
      expect(result.threats.some(t => t.type === ThreatType.XSS)).toBe(true);
    });

    test('should return clean result for safe request', () => {
      const req = createMockRequest({
        url: '/api/users',
        query: { page: '1', limit: '10' },
        body: { name: 'John Doe', email: 'john@example.com' }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(false);
      expect(result.threats).toHaveLength(0);
      expect(result.riskScore).toBe(0);
      expect(result.recommendation).toBe('allow');
    });
  });

  describe('quickSuspiciousCheck', () => {
    test('should quickly detect obvious threats in URL', () => {
      const maliciousReq = createMockRequest({
        url: '/search?q=<script>alert(1)</script>'
      });

      expect(quickSuspiciousCheck(maliciousReq)).toBe(true);
    });

    test('should return false for clean URLs', () => {
      const cleanReq = createMockRequest({
        url: '/api/users/123'
      });

      expect(quickSuspiciousCheck(cleanReq)).toBe(false);
    });

    test('should handle undefined URL gracefully', () => {
      const req = createMockRequest({ url: undefined });

      expect(quickSuspiciousCheck(req)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    test('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(malicious);

      expect(sanitized).toBe('[SCRIPT_REMOVED]Hello World');
    });

    test('should block javascript protocols', () => {
      const malicious = 'javascript:alert(1)';
      const sanitized = sanitizeInput(malicious);

      expect(sanitized).toBe('blocked:alert(1)');
    });

    test('should block event handlers', () => {
      const malicious = '<img onload="alert(1)" src="x">';
      const sanitized = sanitizeInput(malicious);

      expect(sanitized).toBe('<img blocked="alert(1)" src="x">');
    });

    test('should remove control characters', () => {
      const malicious = 'Hello\x00World\x1f!';
      const sanitized = sanitizeInput(malicious);

      expect(sanitized).toBe('HelloWorld!');
    });

    test('should handle non-string inputs gracefully', () => {
      expect(sanitizeInput(null as any)).toBe(null);
      expect(sanitizeInput(undefined as any)).toBe(undefined);
      expect(sanitizeInput(123 as any)).toBe(123);
    });
  });

  describe('Risk scoring and recommendations', () => {
    test('should assign high risk score for critical threats', () => {
      const req = createMockRequest({
        url: '/api',
        body: {
          data: '<script>alert("xss")</script>',
          sql: "1'; DROP TABLE users; --"
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.riskScore).toBeGreaterThan(80);
      expect(result.recommendation).toBe('block');
    });

    test('should assign medium risk for moderate threats', () => {
      const req = createMockRequest({
        query: {
          path: '../config.txt'
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.riskScore).toBeGreaterThan(20);
      expect(result.riskScore).toBeLessThan(80);
    });

    test('should handle multiple low-severity threats', () => {
      const req = createMockRequest({
        url: '/api?debug=1',
        query: {
          // Multiple SQL comment attempts (low severity)
          q1: 'search -- comment',
          q2: 'another -- comment',
          q3: 'third -- comment'
        }
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.threats.length).toBeGreaterThan(2);
      expect(result.riskScore).toBeGreaterThan(0);
    });
  });

  describe('generateSecurityReport', () => {
    test('should generate readable report for suspicious request', () => {
      const req = createMockRequest({
        url: '/search?q=<script>alert(1)</script>',
        body: { sql: "1' OR 1=1" }
      });

      const result = analyzeSuspiciousRequest(req);
      const report = generateSecurityReport(result);

      expect(report).toContain('Security Analysis Report');
      expect(report).toContain('Risk Score:');
      expect(report).toContain('XSS');
      expect(report).toContain('SQL_INJECTION');
      expect(report).toContain('[CRITICAL]');
    });

    test('should generate clean report for safe request', () => {
      const req = createMockRequest({
        url: '/api/users',
        query: { page: '1' }
      });

      const result = analyzeSuspiciousRequest(req);
      const report = generateSecurityReport(result);

      expect(report).toContain('Request appears clean');
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle malformed JSON in body gracefully', () => {
      const req = createMockRequest({
        body: { circular: {} }
      });
      
      // Create circular reference
      req.body.circular.self = req.body.circular;

      expect(() => analyzeSuspiciousRequest(req)).not.toThrow();
    });

    test('should handle very long strings', () => {
      const longString = 'x'.repeat(20000);
      const req = createMockRequest({
        query: { data: longString }
      });

      const result = analyzeSuspiciousRequest(req);

      // Should detect malformed data for very long strings
      expect(result.threats.some(t => t.type === ThreatType.MALFORMED_DATA)).toBe(true);
    });

    test('should handle special characters and encodings', () => {
      const req = createMockRequest({
        url: '/search?q=%3Cscript%3Ealert%281%29%3C%2Fscript%3E' // URL-encoded <script>alert(1)</script>
      });

      const result = analyzeSuspiciousRequest(req);

      expect(result.isSuspicious).toBe(true);
    });

    test('should limit analysis depth for deeply nested objects', () => {
      const deepObj: any = {};
      let current = deepObj;
      
      // Create object with depth > 10
      for (let i = 0; i < 15; i++) {
        current.next = { level: i };
        current = current.next;
      }
      
      current.malicious = '<script>alert(1)</script>';

      const req = createMockRequest({
        body: deepObj
      });

      // Should not throw stack overflow and should still work
      expect(() => analyzeSuspiciousRequest(req)).not.toThrow();
    });
  });
});