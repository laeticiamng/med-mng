/**
 * Utilitaires pour la Content Security Policy (CSP)
 * Aide à éliminer 'unsafe-inline' de manière sécurisée
 */

export interface CSPDirectives {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  frameSrc?: string[];
  childSrc?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
}

/**
 * Configuration CSP stricte pour production
 */
export const STRICT_CSP_CONFIG: CSPDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    // Scripts Supabase nécessaires
    "https://yaincoxihiqdksxgrsrk.supabase.co",
    "https://*.supabase.co",
    // CDN autorisés pour les dépendances
    "https://cdn.jsdelivr.net"
  ],
  styleSrc: [
    "'self'",
    // Pas d'unsafe-inline - tous les styles doivent être dans des fichiers CSS
    "https://fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "blob:"
  ],
  connectSrc: [
    "'self'",
    "https://yaincoxihiqdksxgrsrk.supabase.co",
    "https://*.supabase.co",
    // WebSockets Supabase
    "wss://yaincoxihiqdksxgrsrk.supabase.co",
    "wss://*.supabase.co"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", "https:", "blob:"],
  frameSrc: ["'none'"],
  childSrc: ["'none'"],
  workerSrc: ["'self'", "blob:"],
  manifestSrc: ["'self'"]
};

/**
 * Configuration CSP pour développement (plus permissive)
 */
export const DEV_CSP_CONFIG: CSPDirectives = {
  ...STRICT_CSP_CONFIG,
  scriptSrc: [
    ...(STRICT_CSP_CONFIG.scriptSrc || []),
    "'unsafe-eval'", // Nécessaire pour le dev avec Vite
    "http://localhost:*",
    "ws://localhost:*"
  ],
  connectSrc: [
    ...(STRICT_CSP_CONFIG.connectSrc || []),
    "http://localhost:*",
    "ws://localhost:*",
    "wss://localhost:*"
  ]
};

/**
 * Génère une string CSP à partir des directives
 */
export function generateCSPString(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      const kebabCase = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabCase} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Calcule un hash SHA-256 pour les inline scripts (alternative à unsafe-inline)
 */
export function generateScriptHash(scriptContent: string): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(scriptContent).digest('base64');
  return `'sha256-${hash}'`;
}

/**
 * Génère des nonces pour les scripts inline (plus sécurisé qu'unsafe-inline)
 */
export function generateNonce(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Valide si une CSP est sécurisée (pas d'unsafe-inline, unsafe-eval)
 */
export function validateCSPSecurity(directives: CSPDirectives): {
  isSecure: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Vérifier styleSrc pour unsafe-inline
  if (directives.styleSrc?.includes("'unsafe-inline'")) {
    warnings.push("styleSrc contient 'unsafe-inline' - risque XSS");
    recommendations.push("Déplacer tous les styles inline vers des fichiers CSS externes");
  }

  // Vérifier scriptSrc pour unsafe-inline et unsafe-eval
  if (directives.scriptSrc?.includes("'unsafe-inline'")) {
    warnings.push("scriptSrc contient 'unsafe-inline' - risque XSS critique");
    recommendations.push("Utiliser des nonces ou des hashes SHA-256 pour les scripts inline");
  }

  if (directives.scriptSrc?.includes("'unsafe-eval'")) {
    warnings.push("scriptSrc contient 'unsafe-eval' - acceptable uniquement en développement");
    recommendations.push("Supprimer 'unsafe-eval' en production");
  }

  // Vérifier default-src
  if (directives.defaultSrc?.includes("*")) {
    warnings.push("default-src contient '*' - trop permissif");
    recommendations.push("Spécifier explicitement les sources autorisées");
  }

  const isSecure = warnings.filter(w => !w.includes('acceptable uniquement en développement')).length === 0;

  return { isSecure, warnings, recommendations };
}

/**
 * Middleware Express pour appliquer la CSP
 */
export function createCSPMiddleware(environment: 'development' | 'production' = 'production') {
  const config = environment === 'development' ? DEV_CSP_CONFIG : STRICT_CSP_CONFIG;
  const cspString = generateCSPString(config);

  return (req: any, res: any, next: any) => {
    res.setHeader('Content-Security-Policy', cspString);
    next();
  };
}

/**
 * Extrait tous les styles inline d'un HTML et génère un fichier CSS
 */
export function extractInlineStyles(html: string): {
  cleanHtml: string;
  extractedCSS: string;
  styleCount: number;
} {
  let styleCount = 0;
  let extractedCSS = '';
  
  // Pattern pour matcher les attributs style
  const styleAttributePattern = /style="([^"]*)"/g;
  const inlineStylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;

  // Extraire les styles inline des balises style
  let cleanHtml = html.replace(inlineStylePattern, (match, styles) => {
    extractedCSS += `/* Style block ${++styleCount} */\n${styles}\n\n`;
    return ''; // Supprimer la balise style
  });

  // Extraire les attributs style
  const styleClasses = new Map<string, string>();
  cleanHtml = cleanHtml.replace(styleAttributePattern, (match, styles) => {
    const className = `extracted-style-${++styleCount}`;
    styleClasses.set(className, styles);
    extractedCSS += `.${className} { ${styles} }\n`;
    return `class="${className}"`;
  });

  return {
    cleanHtml,
    extractedCSS,
    styleCount
  };
}

/**
 * Génère un rapport de sécurité CSP
 */
export function generateCSPSecurityReport(): {
  currentConfig: CSPDirectives;
  securityAnalysis: ReturnType<typeof validateCSPSecurity>;
  recommendedConfig: CSPDirectives;
  migrationSteps: string[];
} {
  const currentConfig = DEV_CSP_CONFIG; // Ou récupérer depuis la config actuelle
  const securityAnalysis = validateCSPSecurity(currentConfig);
  const recommendedConfig = STRICT_CSP_CONFIG;

  const migrationSteps = [
    "1. Extraire tous les styles inline vers des fichiers CSS externes",
    "2. Remplacer 'unsafe-inline' par des classes CSS spécifiques",
    "3. Utiliser des nonces ou hashes pour les scripts essentiels",
    "4. Tester la compatibilité avec la CSP stricte",
    "5. Déployer progressivement en mode 'report-only'",
    "6. Activer la CSP stricte en production"
  ];

  return {
    currentConfig,
    securityAnalysis,
    recommendedConfig,
    migrationSteps
  };
}