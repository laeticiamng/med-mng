import { Request } from 'express';

/**
 * Types de menaces détectées
 */
export enum ThreatType {
  XSS = 'xss',
  SQL_INJECTION = 'sql_injection',
  PATH_TRAVERSAL = 'path_traversal',
  COMMAND_INJECTION = 'command_injection',
  JAVASCRIPT_PROTOCOL = 'javascript_protocol',
  MALFORMED_DATA = 'malformed_data',
  SUSPICIOUS_PATTERNS = 'suspicious_patterns'
}

/**
 * Résultat de l'analyse de sécurité
 */
export interface SecurityAnalysisResult {
  isSuspicious: boolean;
  threats: Array<{
    type: ThreatType;
    pattern: string;
    location: 'url' | 'query' | 'body' | 'headers';
    value: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  riskScore: number; // 0-100, higher = more dangerous
  recommendation: 'allow' | 'warn' | 'block';
}

/**
 * Patterns de détection organisés par type de menace
 */
const THREAT_PATTERNS = {
  [ThreatType.XSS]: [
    { pattern: /<script[^>]*>/gi, severity: 'critical' as const },
    { pattern: /javascript:/gi, severity: 'high' as const },
    { pattern: /on\w+\s*=/gi, severity: 'high' as const },
    { pattern: /<iframe[^>]*>/gi, severity: 'high' as const },
    { pattern: /<object[^>]*>/gi, severity: 'medium' as const },
    { pattern: /<embed[^>]*>/gi, severity: 'medium' as const },
    { pattern: /eval\s*\(/gi, severity: 'high' as const },
    { pattern: /expression\s*\(/gi, severity: 'medium' as const },
  ],
  
  [ThreatType.SQL_INJECTION]: [
    { pattern: /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/gi, severity: 'critical' as const },
    { pattern: /(\bor\b\s+\d+\s*=\s*\d+)|(\band\b\s+\d+\s*=\s*\d+)/gi, severity: 'high' as const },
    { pattern: /'\s*(or|and)\s*'.*'=/gi, severity: 'high' as const },
    { pattern: /;\s*(drop|delete|truncate|alter)\b/gi, severity: 'critical' as const },
    { pattern: /\b(exec|execute)\s*\(/gi, severity: 'high' as const },
    { pattern: /\/\*.*\*\//g, severity: 'medium' as const },
    { pattern: /--[^\r\n]*/g, severity: 'low' as const },
    { pattern: /'\s*;\s*--/gi, severity: 'high' as const },
  ],
  
  [ThreatType.PATH_TRAVERSAL]: [
    { pattern: /\.\.\//g, severity: 'high' as const },
    { pattern: /\.\.\\./g, severity: 'high' as const },
    { pattern: /%2e%2e%2f/gi, severity: 'high' as const },
    { pattern: /%2e%2e%5c/gi, severity: 'high' as const },
    { pattern: /\.\.%2f/gi, severity: 'medium' as const },
    { pattern: /\.\.\\/g, severity: 'high' as const },
  ],
  
  [ThreatType.COMMAND_INJECTION]: [
    { pattern: /;\s*(ls|cat|wget|curl|nc|netcat|bash|sh)\b/gi, severity: 'critical' as const },
    { pattern: /\|\s*(ls|cat|wget|curl|nc|netcat|bash|sh)\b/gi, severity: 'critical' as const },
    { pattern: /`[^`]*`/g, severity: 'high' as const },
    { pattern: /\$\([^)]*\)/g, severity: 'high' as const },
    { pattern: /&&\s*\w+/g, severity: 'medium' as const },
  ],
  
  [ThreatType.MALFORMED_DATA]: [
    { pattern: /[\x00-\x1f\x7f-\x9f]/g, severity: 'medium' as const },
    { pattern: /\0/g, severity: 'high' as const },
    { pattern: /.{10000,}/g, severity: 'low' as const }, // Very long strings
  ],
  
  [ThreatType.SUSPICIOUS_PATTERNS]: [
    { pattern: /base64_decode\s*\(/gi, severity: 'medium' as const },
    { pattern: /eval\s*\(/gi, severity: 'high' as const },
    { pattern: /system\s*\(/gi, severity: 'high' as const },
    { pattern: /passthru\s*\(/gi, severity: 'high' as const },
    { pattern: /shell_exec\s*\(/gi, severity: 'high' as const },
  ]
};

/**
 * Headers suspects à surveiller
 * Note: 'host' retiré pour éviter les faux positifs avec les proxies légitimes
 */
const SUSPICIOUS_HEADERS = [
  'x-forwarded-for', 'x-real-ip', 'x-forwarded-host'
];

/**
 * Analyse une chaîne de caractères pour détecter des patterns suspects
 */
function analyzeString(
  input: string, 
  location: 'url' | 'query' | 'body' | 'headers'
): SecurityAnalysisResult['threats'] {
  const threats: SecurityAnalysisResult['threats'] = [];
  
  if (!input || typeof input !== 'string') {
    return threats;
  }
  
  // Analyser chaque type de menace
  Object.entries(THREAT_PATTERNS).forEach(([threatType, patterns]) => {
    patterns.forEach(({ pattern, severity }) => {
      const matches = input.match(pattern);
      if (matches) {
        matches.forEach(match => {
          threats.push({
            type: threatType as ThreatType,
            pattern: pattern.source,
            location,
            value: match.substring(0, 100), // Limiter la longueur loggée
            severity
          });
        });
      }
    });
  });
  
  return threats;
}

/**
 * Analyse un objet récursivement pour détecter des patterns suspects
 */
function analyzeObject(
  obj: any, 
  location: 'query' | 'body',
  maxDepth: number = 3,
  currentDepth: number = 0
): SecurityAnalysisResult['threats'] {
  const threats: SecurityAnalysisResult['threats'] = [];
  
  if (currentDepth >= maxDepth || !obj) {
    return threats;
  }
  
  if (typeof obj === 'string') {
    return analyzeString(obj, location);
  }
  
  if (typeof obj === 'object') {
    // Analyser les clés
    Object.keys(obj).forEach(key => {
      threats.push(...analyzeString(key, location));
    });
    
    // Analyser les valeurs récursivement
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        threats.push(...analyzeString(value, location));
      } else if (typeof value === 'object' && value !== null) {
        threats.push(...analyzeObject(value, location, maxDepth, currentDepth + 1));
      }
    });
  }
  
  return threats;
}

/**
 * Calcule le score de risque basé sur les menaces détectées
 */
function calculateRiskScore(threats: SecurityAnalysisResult['threats']): number {
  if (threats.length === 0) return 0;
  
  const severityScores = {
    'low': 10,
    'medium': 25,
    'high': 50,
    'critical': 100
  };
  
  let totalScore = 0;
  let maxScore = 0;
  
  threats.forEach(threat => {
    const score = severityScores[threat.severity];
    totalScore += score;
    maxScore = Math.max(maxScore, score);
  });
  
  // Combiner score total et score maximum pour un calcul plus nuancé
  return Math.min(100, Math.round((totalScore * 0.3) + (maxScore * 0.7)));
}

/**
 * Détermine la recommandation basée sur le score de risque
 */
function getRecommendation(riskScore: number): SecurityAnalysisResult['recommendation'] {
  if (riskScore >= 80) return 'block';
  if (riskScore >= 40) return 'warn';
  return 'allow';
}

/**
 * Analyse complète d'une requête pour détecter des patterns suspects
 */
export function analyzeSuspiciousRequest(req: Request): SecurityAnalysisResult {
  const allThreats: SecurityAnalysisResult['threats'] = [];
  
  // 1. Analyser l'URL
  if (req.url) {
    allThreats.push(...analyzeString(req.url, 'url'));
  }
  
  // 2. Analyser les paramètres de requête
  if (req.query && Object.keys(req.query).length > 0) {
    allThreats.push(...analyzeObject(req.query, 'query'));
  }
  
  // 3. Analyser le body
  if (req.body && typeof req.body === 'object') {
    allThreats.push(...analyzeObject(req.body, 'body'));
  }
  
  // 4. Analyser les headers suspects
  SUSPICIOUS_HEADERS.forEach(headerName => {
    const headerValue = req.get(headerName);
    if (headerValue) {
      allThreats.push(...analyzeString(headerValue, 'headers'));
    }
  });
  
  // 5. Analyser User-Agent pour des patterns suspects
  const userAgent = req.get('User-Agent');
  if (userAgent) {
    allThreats.push(...analyzeString(userAgent, 'headers'));
  }
  
  const riskScore = calculateRiskScore(allThreats);
  const recommendation = getRecommendation(riskScore);
  
  return {
    isSuspicious: allThreats.length > 0,
    threats: allThreats,
    riskScore,
    recommendation
  };
}

/**
 * Analyse rapide pour déterminer si une requête nécessite une analyse complète
 */
export function quickSuspiciousCheck(req: Request): boolean {
  // Vérifications rapides sur l'URL uniquement
  const url = req.url?.toLowerCase() || '';
  const quickPatterns = [
    /\.\./,
    /<script/i,
    /union.*select/i,
    /javascript:/i,
    /;.*drop\b/i
  ];
  
  return quickPatterns.some(pattern => pattern.test(url));
}

/**
 * Filtre et sanitise les données suspectes (optionnel - à utiliser avec précaution)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return input;
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '[SCRIPT_REMOVED]')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/on\w+\s*=/gi, 'blocked=')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .trim();
}

/**
 * Génère un rapport de sécurité lisible
 */
export function generateSecurityReport(result: SecurityAnalysisResult): string {
  if (!result.isSuspicious) {
    return 'Request appears clean - no suspicious patterns detected.';
  }
  
  const threatsByType = result.threats.reduce((acc, threat) => {
    if (!acc[threat.type]) acc[threat.type] = [];
    acc[threat.type].push(threat);
    return acc;
  }, {} as Record<ThreatType, typeof result.threats>);
  
  let report = `Security Analysis Report (Risk Score: ${result.riskScore}/100 - ${result.recommendation.toUpperCase()})\n`;
  report += `${'='.repeat(60)}\n`;
  
  Object.entries(threatsByType).forEach(([type, threats]) => {
    report += `\n${type.toUpperCase()} (${threats.length} detected):\n`;
    threats.forEach((threat, index) => {
      report += `  ${index + 1}. [${threat.severity.toUpperCase()}] in ${threat.location}: "${threat.value}"\n`;
    });
  });
  
  return report;
}