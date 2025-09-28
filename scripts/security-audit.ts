#!/usr/bin/env node
/**
 * 🔐 SCRIPT AUDIT SÉCURITÉ AUTOMATISÉ - Ticket 1
 * Sécurisation des credentials & gestion des secrets
 * 
 * Ce script implémente toutes les exigences du Ticket 1:
 * - 1.1 Audit & refacto des identifiants/clefs sensibles
 * - 1.2 Sécurisation des logs  
 * - 1.3 Automatisation de la vérification
 */

import { createClient } from '@supabase/supabase-js';
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Configuration
const SCAN_PATTERNS = [
  'supabase/functions/**/*.ts',
  'src/**/*.ts',
  'src/**/*.tsx', 
  'scripts/**/*.ts',
  'scripts/**/*.js'
];

const CRITICAL_PATTERNS = [
  // 1.1 Credentials en dur - BANNIR ABSOLUMENT
  {
    name: 'Hardcoded Credential Fallback',
    pattern: /Deno\.env\.get\([^)]+\)\s*\|\|\s*['""][^'"]*['""]/, 
    severity: 'CRITICAL',
    fix: 'Supprimer le fallback, utiliser UNIQUEMENT la variable d\'environnement'
  },
  {
    name: 'Hardcoded Email/Username', 
    pattern: /['""][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['""]/, 
    severity: 'HIGH',
    fix: 'Remplacer par Deno.env.get() ou variable de configuration'
  },
  {
    name: 'Hardcoded Password',
    pattern: /password.*[=:]\s*['""][^'"]+['""]|['""][A-Z][a-zA-Z0-9]*[!@#$%^&*][a-zA-Z0-9]*['""]/,
    severity: 'CRITICAL', 
    fix: 'JAMAIS de mot de passe en dur - utiliser Deno.env.get()'
  },
  
  // 1.2 Logs sensibles - MASQUER OBLIGATOIREMENT
  {
    name: 'Credential in Console Log',
    pattern: /console\.log.*(?:password|key|token|secret|credential)/i,
    severity: 'HIGH',
    fix: 'Masquer ou supprimer le log de credential'
  },
  {
    name: 'Full Credential Logged',
    pattern: /console\.log.*Deno\.env\.get\([^)]+\)/,
    severity: 'MEDIUM', 
    fix: 'Logger seulement si présent/absent, pas la valeur'
  },
  
  // API Keys détectées
  {
    name: 'OpenAI API Key',
    pattern: /sk-[A-Za-z0-9]{48}/,
    severity: 'CRITICAL',
    fix: 'Supprimer immédiatement et régénérer la clé'
  },
  {
    name: 'Stripe Secret Key',
    pattern: /sk_live_[A-Za-z0-9]{24}/,
    severity: 'CRITICAL', 
    fix: 'Supprimer immédiatement et régénérer la clé'
  }
];

interface SecurityViolation {
  file: string;
  line: number;
  pattern: string;
  severity: string;
  content: string;
  fix: string;
}

export class SecurityAuditor {
  private violations: SecurityViolation[] = [];
  
  async scanAllFiles(): Promise<SecurityViolation[]> {
    console.log('🔍 SCANNING FOR SECURITY VIOLATIONS...');
    
    const allFiles: string[] = [];
    for (const pattern of SCAN_PATTERNS) {
      const files = await glob(pattern, { ignore: ['node_modules/**', 'dist/**', '.git/**'] });
      allFiles.push(...files);
    }
    
    console.log(`📁 Found ${allFiles.length} files to scan`);
    
    for (const file of allFiles) {
      await this.scanFile(file);
    }
    
    return this.violations;
  }
  
  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        CRITICAL_PATTERNS.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            this.violations.push({
              file: filePath,
              line: index + 1,
              pattern: pattern.name,
              severity: pattern.severity,
              content: line.trim(),
              fix: pattern.fix
            });
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error);
    }
  }
  
  generateReport(): string {
    const critical = this.violations.filter(v => v.severity === 'CRITICAL');
    const high = this.violations.filter(v => v.severity === 'HIGH'); 
    const medium = this.violations.filter(v => v.severity === 'MEDIUM');
    
    let report = `
🚨 RAPPORT AUDIT SÉCURITÉ - Ticket 1
${'='.repeat(50)}

📊 RÉSUMÉ:
- Violations CRITIQUES: ${critical.length}
- Violations HAUTES: ${high.length}  
- Violations MOYENNES: ${medium.length}
- TOTAL: ${this.violations.length}

`;

    if (critical.length > 0) {
      report += `
🔴 VIOLATIONS CRITIQUES (À CORRIGER IMMÉDIATEMENT):
${'-'.repeat(50)}
`;
      critical.forEach(v => {
        report += `
📁 ${v.file}:${v.line}
🚨 ${v.pattern}
💻 Code: ${v.content}
🔧 Fix: ${v.fix}
`;
      });
    }
    
    if (high.length > 0) {
      report += `
🟡 VIOLATIONS HAUTES:
${'-'.repeat(30)}
`;
      high.forEach(v => {
        report += `
📁 ${v.file}:${v.line} - ${v.pattern}
💻 ${v.content}
🔧 ${v.fix}
`;
      });
    }
    
    if (medium.length > 0) {
      report += `
🟢 VIOLATIONS MOYENNES:
${'-'.repeat(30)}
`;
      medium.forEach(v => {
        report += `📁 ${v.file}:${v.line} - ${v.pattern}\n`;
      });
    }
    
    report += `
${'='.repeat(50)}
✅ ACTIONS RECOMMANDÉES:
1. Corriger IMMÉDIATEMENT toutes les violations critiques
2. Supprimer tous les fallbacks avec credentials en dur
3. Masquer tous les logs de credentials sensibles
4. Régénérer toutes les API keys détectées
5. Relancer ce scan après corrections

🔗 Documentation: docs/security-best-practices.md
`;
    
    return report;
  }
  
  shouldBlockBuild(): boolean {
    return this.violations.some(v => v.severity === 'CRITICAL');
  }
}

// Fonction principale
async function runSecurityAudit(): Promise<void> {
  console.log('🔐 DÉMARRAGE AUDIT SÉCURITÉ - Ticket 1');
  console.log('Conformité: Sécurisation des credentials & gestion des secrets\n');
  
  const auditor = new SecurityAuditor();
  const violations = await auditor.scanAllFiles();
  
  const report = auditor.generateReport();
  console.log(report);
  
  // Sauvegarder le rapport
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `security-audit-report-${timestamp}.md`;
  writeFileSync(reportPath, report);
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
  
  // Bloquer le build si violations critiques
  if (auditor.shouldBlockBuild()) {
    console.log('\n🔴 BUILD BLOQUÉ - Violations critiques détectées!');
    console.log('Corrigez les violations critiques avant de continuer.');
    process.exit(1);
  } else {
    console.log('\n✅ AUDIT SÉCURITÉ RÉUSSI - Aucune violation critique');
  }
}

// Lancer si appelé directement
if (require.main === module) {
  runSecurityAudit().catch(error => {
    console.error('❌ Erreur audit sécurité:', error);
    process.exit(1);
  });
}

export { runSecurityAudit, SecurityAuditor };