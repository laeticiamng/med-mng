import { useState, useEffect } from 'react';

interface SecurityValidationResult {
  score: number;
  issues: SecurityIssue[];
  recommendations: string[];
  isSecure: boolean;
}

interface SecurityIssue {
  type: 'critical' | 'warning' | 'info';
  message: string;
  details?: string;
}

export function useSecurityValidation() {
  const [validation, setValidation] = useState<SecurityValidationResult>({
    score: 0,
    issues: [],
    recommendations: [],
    isSecure: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateSecurity();
  }, []);

  const validateSecurity = async () => {
    setLoading(true);
    
    try {
      const issues: SecurityIssue[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Check HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        issues.push({
          type: 'critical',
          message: 'Site not served over HTTPS',
          details: 'All production sites should use HTTPS to encrypt data in transit'
        });
        recommendations.push('Configure HTTPS/TLS certificate');
        score -= 30;
      }

      // Check CSP header
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        issues.push({
          type: 'warning',
          message: 'Content Security Policy not detected',
          details: 'CSP helps prevent XSS attacks'
        });
        recommendations.push('Implement Content Security Policy headers');
        score -= 15;
      }

      // Check X-Frame-Options
      const frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!frameMeta) {
        issues.push({
          type: 'warning',
          message: 'X-Frame-Options header missing',
          details: 'Prevents clickjacking attacks'
        });
        recommendations.push('Add X-Frame-Options: DENY header');
        score -= 10;
      }

      // Check for inline scripts
      const inlineScripts = document.querySelectorAll('script:not([src])');
      if (inlineScripts.length > 2) {
        issues.push({
          type: 'warning',
          message: `${inlineScripts.length} inline scripts detected`,
          details: 'Inline scripts can increase XSS risk'
        });
        recommendations.push('Move inline scripts to external files');
        score -= 5;
      }

      // Check for sensitive data in localStorage
      try {
        const sensitiveKeys = ['password', 'secret', 'key', 'token'];
        const storageKeys = Object.keys(localStorage);
        const foundSensitive = storageKeys.filter(key => 
          sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
        );
        
        if (foundSensitive.length > 0) {
          issues.push({
            type: 'warning',
            message: `Potentially sensitive data in localStorage: ${foundSensitive.join(', ')}`,
            details: 'Sensitive data should be stored securely'
          });
          recommendations.push('Review localStorage usage for sensitive data');
          score -= 10;
        }
      } catch (e) {
        // Storage access might be blocked
      }

      // Check for mixed content
      if (location.protocol === 'https:') {
        const httpResources = Array.from(document.querySelectorAll('img, script, link')).filter(el => {
          const src = el.getAttribute('src') || el.getAttribute('href');
          return src && src.startsWith('http://');
        });

        if (httpResources.length > 0) {
          issues.push({
            type: 'critical',
            message: `${httpResources.length} mixed content resources detected`,
            details: 'HTTP resources on HTTPS site can be blocked by browsers'
          });
          recommendations.push('Update all resources to use HTTPS');
          score -= 20;
        }
      }

      // Check for deprecated APIs
      const deprecatedChecks = [
        { api: 'document.domain', message: 'document.domain usage detected' },
        { api: 'window.eval', message: 'eval() usage detected' },
      ];

      deprecatedChecks.forEach(check => {
        try {
          if (window[check.api as any]) {
            issues.push({
              type: 'warning',
              message: check.message,
              details: 'Deprecated APIs may have security implications'
            });
            score -= 5;
          }
        } catch (e) {
          // API check failed
        }
      });

      // Additional recommendations based on score
      if (score < 80) {
        recommendations.push('Consider implementing a Web Application Firewall (WAF)');
        recommendations.push('Regular security audits recommended');
      }

      if (score < 60) {
        recommendations.push('Implement Subresource Integrity (SRI) for external scripts');
        recommendations.push('Add security.txt file for responsible disclosure');
      }

      setValidation({
        score: Math.max(0, score),
        issues,
        recommendations,
        isSecure: score >= 80 && issues.filter(i => i.type === 'critical').length === 0
      });

    } catch (error) {
      setValidation({
        score: 0,
        issues: [{
          type: 'critical',
          message: 'Security validation failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }],
        recommendations: ['Manual security review required'],
        isSecure: false
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      url: location.href,
      userAgent: navigator.userAgent,
      ...validation
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    validation,
    loading,
    revalidate: validateSecurity,
    exportReport
  };
}