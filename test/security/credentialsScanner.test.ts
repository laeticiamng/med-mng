/**
 * 🧪 TESTS UNITAIRES - Scanner de credentials
 * Point 2.1 du ticket global : Tests des parseurs critiques de sécurité
 */

import { SecurityAuditor } from '../../scripts/security-audit';

describe('🔐 SecurityAuditor - Scanner de credentials', () => {
  
  let auditor: SecurityAuditor;
  
  beforeEach(() => {
    auditor = new SecurityAuditor();
  });

  describe('🎯 Détection de credentials en dur', () => {
    
    test('🚨 Détecte les fallbacks avec credentials', () => {
      const testContent = `
        const apiKey = Deno.env.get("API_KEY") || "hardcoded-key-123";
        const password = Deno.env.get("PASSWORD") || "secret123!";
      `;
      
      const violations = auditor.scanContent(testContent, 'test-fallback.ts');
      
      expect(violations).toHaveLength(2);
      expect(violations[0].pattern).toBe('Hardcoded Credential Fallback');
      expect(violations[0].severity).toBe('CRITICAL');
      expect(violations[1].pattern).toBe('Hardcoded Credential Fallback');
    });

    test('🚨 Détecte les emails/usernames codés en dur', () => {
      const testContent = `
        const email = "admin@example.com";
        const username = "test.user@domain.fr";
      `;
      
      const violations = auditor.scanContent(testContent, 'test-email.ts');
      
      expect(violations).toHaveLength(2);
      expect(violations[0].pattern).toBe('Hardcoded Email/Username');
      expect(violations[0].severity).toBe('HIGH');
    });

    test('🚨 Détecte les mots de passe complexes', () => {
      const testContent = `
        const pwd = "MyPassword123!";
        const secret = "SuperSecret456@";
      `;
      
      const violations = auditor.scanContent(testContent, 'test-password.ts');
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.pattern === 'Hardcoded Password')).toBe(true);
    });
  });

  describe('🔍 Détection d\'API Keys spécifiques', () => {
    
    test('🔑 Détecte les clés OpenAI', () => {
      const testContent = `
        const openaiKey = "sk-" + "A".repeat(48);
      `;
      
      const violations = auditor.scanContent(testContent, 'test-openai.ts');
      
      expect(violations).toHaveLength(1);
      expect(violations[0].pattern).toBe('OpenAI API Key');
      expect(violations[0].severity).toBe('CRITICAL');
    });

    test('🔑 Détecte les clés Stripe', () => {
      const testContent = `
        const stripeSecret = "sk_live_" + "A".repeat(24);
        const stripeTest = "sk_test_" + "B".repeat(24);
      `;
      
      const violations = auditor.scanContent(testContent, 'test-stripe.ts');
      
      expect(violations).toHaveLength(2);
      expect(violations[0].pattern).toBe('Stripe Secret Key');
      expect(violations[0].severity).toBe('CRITICAL');
      expect(violations[1].pattern).toBe('Stripe Test Key');
      expect(violations[1].severity).toBe('MEDIUM');
    });

    test('🔑 Détecte les clés AWS', () => {
      const testContent = `
        const awsKey = "AKIA" + "X".repeat(16);
      `;
      
      const violations = auditor.scanContent(testContent, 'test-aws.ts');
      
      expect(violations).toHaveLength(1);
      expect(violations[0].pattern).toBe('AWS Access Key');
      expect(violations[0].severity).toBe('CRITICAL');
    });
  });

  describe('📝 Détection de logs sensibles', () => {
    
    test('🚨 Détecte les logs de credentials', () => {
      const testContent = `
        console.log("Password:", userPassword);
        console.log("API Key is:", apiKey);
        console.log("Secret token:", secret);
        console.log("User credential:", credential);
      `;
      
      const violations = auditor.scanContent(testContent, 'test-logs.ts');
      
      expect(violations).toHaveLength(4);
      expect(violations.every(v => v.pattern === 'Credential in Console Log')).toBe(true);
      expect(violations.every(v => v.severity === 'HIGH')).toBe(true);
    });

    test('⚠️ Détecte les logs d\'env vars complètes', () => {
      const testContent = `
        console.log("Env var:", Deno.env.get("SECRET_KEY"));
        console.log(Deno.env.get("API_TOKEN"));
      `;
      
      const violations = auditor.scanContent(testContent, 'test-env-logs.ts');
      
      expect(violations).toHaveLength(2);
      expect(violations.every(v => v.pattern === 'Full Credential Logged')).toBe(true);
      expect(violations.every(v => v.severity === 'MEDIUM')).toBe(true);
    });
  });

  describe('✅ Cas valides (ne doivent pas déclencher)', () => {
    
    test('✅ Ignore les variables d\'environnement correctes', () => {
      const testContent = `
        const apiKey = Deno.env.get("API_KEY");
        if (!apiKey) {
          throw new Error("API_KEY is required");
        }
        console.log("API Key:", apiKey ? "SET" : "MISSING");
      `;
      
      const violations = auditor.scanContent(testContent, 'test-valid.ts');
      
      expect(violations).toHaveLength(0);
    });

    test('✅ Ignore les commentaires et documentation', () => {
      const testContent = `
        // Example: const key = Deno.env.get("API_KEY") || "fallback";
        /* 
         * Never do: password = "hardcoded123!"
         */
        const validKey = Deno.env.get("VALID_KEY");
      `;
      
      const violations = auditor.scanContent(testContent, 'test-comments.ts');
      
      expect(violations).toHaveLength(0);
    });

    test('✅ Ignore les logs masqués correctement', () => {
      const testContent = `
        console.log("Password:", password ? "***MASKED***" : "NOT_SET");
        console.log("API Key status:", apiKey ? "CONFIGURED" : "MISSING");
        console.log("Secret length:", secret?.length || 0);
      `;
      
      const violations = auditor.scanContent(testContent, 'test-masked.ts');
      
      expect(violations).toHaveLength(0);
    });
  });

  describe('🛡️ Tests de robustesse', () => {
    
    test('❌ Gère les fichiers vides', () => {
      const violations = auditor.scanContent('', 'empty.ts');
      expect(violations).toHaveLength(0);
    });

    test('❌ Gère les caractères spéciaux', () => {
      const testContent = `
        const weird = "ñøt-å-çrëdéntîàl-123!@#$%^&*()";
        console.log("Weird string but not credential");
      `;
      
      const violations = auditor.scanContent(testContent, 'special-chars.ts');
      
      // Ne devrait pas détecter de faux positifs
      expect(violations).toHaveLength(0);
    });

    test('📊 Performance avec gros fichier', () => {
      // Générer un gros fichier sans credentials
      const bigContent = Array(10000).fill('const validCode = "just normal code";').join('\n');
      
      const start = performance.now();
      const violations = auditor.scanContent(bigContent, 'big-file.ts');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Moins de 100ms
      expect(violations).toHaveLength(0);
    });
  });

  describe('📋 Génération de rapports', () => {
    
    test('📊 Génère un rapport structuré', () => {
      const testContent = `
        const key1 = Deno.env.get("KEY") || "fallback123";
        const openai = "sk-" + "A".repeat(48);
        console.log("Password:", pwd);
      `;
      
      const violations = auditor.scanContent(testContent, 'report-test.ts');
      const report = auditor.generateReport();
      
      expect(report).toContain('RAPPORT AUDIT SÉCURITÉ');
      expect(report).toContain('VIOLATIONS CRITIQUES');
      expect(report).toContain('VIOLATIONS HAUTES');
      expect(report).toContain('ACTIONS RECOMMANDÉES');
      
      expect(violations.filter(v => v.severity === 'CRITICAL')).toHaveLength(2); // fallback + openai
      expect(violations.filter(v => v.severity === 'HIGH')).toHaveLength(1); // log password
    });

    test('🚫 Indique si le build doit être bloqué', () => {
      const criticalContent = `const key = Deno.env.get("KEY") || "hardcoded";`;
      const violations = auditor.scanContent(criticalContent, 'critical.ts');
      
      expect(auditor.shouldBlockBuild()).toBe(true);
      
      const safeContent = `const key = Deno.env.get("KEY");`;
      auditor.clearViolations();
      auditor.scanContent(safeContent, 'safe.ts');
      
      expect(auditor.shouldBlockBuild()).toBe(false);
    });
  });

  describe('🔧 Tests d\'intégration MED-MNG', () => {
    
    test('🏥 Détecte les credentials spécifiques MED-MNG', () => {
      const medMngContent = `
        const casUser = Deno.env.get("CAS_USERNAME") || "admin@medecine.fr";
        const sunoKey = Deno.env.get("SUNO_API_KEY") || "suno_test_key_123";
        const unessPwd = Deno.env.get("UNES_PASSWORD") || "UnessPwd2024!";
      `;
      
      const violations = auditor.scanContent(medMngContent, 'med-mng.ts');
      
      expect(violations).toHaveLength(3);
      expect(violations.every(v => v.severity === 'CRITICAL' || v.severity === 'HIGH')).toBe(true);
    });

    test('✅ Accepte la configuration sécurisée MED-MNG', () => {
      const secureContent = `
        const casUsername = Deno.env.get('CAS_USERNAME');
        const casPassword = Deno.env.get('CAS_PASSWORD');
        const sunoApiKey = Deno.env.get('SUNO_API_KEY');
        
        if (!casUsername || !casPassword || !sunoApiKey) {
          throw new Error("Missing required environment variables");
        }
        
        console.log("CAS User:", casUsername ? "CONFIGURED" : "MISSING");
        console.log("Suno API:", sunoApiKey ? "SET" : "NOT_SET");
      `;
      
      const violations = auditor.scanContent(secureContent, 'secure-med-mng.ts');
      
      expect(violations).toHaveLength(0);
    });
  });
});