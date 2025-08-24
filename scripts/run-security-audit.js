#!/usr/bin/env node

/**
 * Script d'audit de sécurité automatisé
 * Usage: node scripts/run-security-audit.js [--fix] [--report]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = process.cwd();
const REPORT_DIR = path.join(PROJECT_ROOT, 'docs', 'security');
const LOG_FILE = path.join(REPORT_DIR, 'audit-log.json');

// Arguments de ligne de commande
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const generateReport = args.includes('--report');

// Patterns de détection de sécurité
const SECURITY_PATTERNS = {
  hardcoded_secrets: [
    /password\s*[:=]\s*["'][^"']{8,}["']/gi,
    /api[_-]?key\s*[:=]\s*["'][^"']{20,}["']/gi,
    /secret\s*[:=]\s*["'][^"']{10,}["']/gi,
    /token\s*[:=]\s*["'][^"']{20,}["']/gi,
  ],
  unsafe_csp: [
    /'unsafe-inline'/gi,
    /'unsafe-eval'/gi,
  ],
  typescript_any: [
    /:\s*any\b/g,
    /as\s+any\b/g,
    /\(.*?\)\s*=>\s*any/g,
  ],
  insecure_patterns: [
    /console\.log\([^)]*password/gi,
    /console\.log\([^)]*secret/gi,
    /innerHTML\s*=/gi,
    /eval\s*\(/gi,
  ]
};

/**
 * Classe principale pour l'audit de sécurité
 */
class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      filesScanned: 0,
      issuesFound: 0,
      criticalIssues: 0,
      fixedIssues: 0
    };
    
    this.ensureReportDirectory();
  }

  /**
   * Point d'entrée principal
   */
  async runAudit() {
    console.log('🔍 Démarrage de l\'audit de sécurité...\n');
    
    try {
      // 1. Scan des fichiers source
      await this.scanSourceFiles();
      
      // 2. Vérification de la configuration
      await this.auditConfiguration();
      
      // 3. Analyse des dépendances
      await this.auditDependencies();
      
      // 4. Génération du rapport
      const report = this.generateReport();
      
      // 5. Affichage des résultats
      this.displayResults(report);
      
      // 6. Sauvegarde du rapport si demandé
      if (generateReport) {
        this.saveReport(report);
      }
      
      // 7. Application des corrections si demandé
      if (shouldFix) {
        await this.applyFixes();
      }
      
      return report;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'audit:', error.message);
      process.exit(1);
    }
  }

  /**
   * Scan des fichiers source pour détecter les problèmes
   */
  async scanSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'logs'];
    
    console.log('📂 Scan des fichiers source...');
    
    await this.walkDirectory(PROJECT_ROOT, (filePath) => {
      const ext = path.extname(filePath);
      const dir = path.dirname(filePath);
      
      // Ignorer certains dossiers et extensions
      if (excludeDirs.some(d => dir.includes(d)) || !extensions.includes(ext)) {
        return;
      }
      
      this.scanFile(filePath);
    });
    
    console.log(`   ✅ ${this.stats.filesScanned} fichiers analysés`);
  }

  /**
   * Scan d'un fichier individuel
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.stats.filesScanned++;
      
      // Test de chaque pattern de sécurité
      Object.entries(SECURITY_PATTERNS).forEach(([category, patterns]) => {
        patterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              this.addIssue({
                type: category,
                severity: this.getSeverity(category),
                file: path.relative(PROJECT_ROOT, filePath),
                pattern: match.substring(0, 100),
                line: this.getLineNumber(content, match),
                recommendation: this.getRecommendation(category)
              });
            });
          }
        });
      });
      
    } catch (error) {
      console.warn(`⚠️ Impossible de lire ${filePath}:`, error.message);
    }
  }

  /**
   * Audit de la configuration de sécurité
   */
  async auditConfiguration() {
    console.log('⚙️ Audit de configuration...');
    
    const configFiles = [
      'src/index.ts',
      'src/middleware/security.ts',
      'src/config/security.ts'
    ];
    
    for (const configFile of configFiles) {
      const fullPath = path.join(PROJECT_ROOT, configFile);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Vérifications spécifiques de configuration
        if (content.includes("'unsafe-inline'")) {
          this.addIssue({
            type: 'unsafe_csp',
            severity: 'critical',
            file: configFile,
            pattern: "'unsafe-inline'",
            recommendation: 'Supprimer unsafe-inline de la CSP'
          });
        }
        
        if (content.includes('cors()') && !content.includes('corsOptions')) {
          this.addIssue({
            type: 'insecure_config',
            severity: 'high',
            file: configFile,
            pattern: 'CORS non configuré',
            recommendation: 'Configurer CORS avec des options strictes'
          });
        }
      }
    }
    
    console.log('   ✅ Configuration auditée');
  }

  /**
   * Audit des dépendances avec npm audit
   */
  async auditDependencies() {
    console.log('📦 Audit des dépendances...');
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            this.addIssue({
              type: 'vulnerable_dependency',
              severity: vuln.severity,
              file: 'package.json',
              pattern: `${pkg}: ${vuln.title}`,
              recommendation: `Mettre à jour ${pkg} vers une version sécurisée`
            });
          }
        });
      }
      
      console.log('   ✅ Dépendances auditées');
      
    } catch (error) {
      console.warn('   ⚠️ npm audit non disponible ou erreur:', error.message);
    }
  }

  /**
   * Ajoute une issue à la liste
   */
  addIssue(issue) {
    this.issues.push({
      ...issue,
      id: this.issues.length + 1,
      timestamp: new Date().toISOString()
    });
    
    this.stats.issuesFound++;
    if (issue.severity === 'critical') {
      this.stats.criticalIssues++;
    }
  }

  /**
   * Génère le rapport final
   */
  generateReport() {
    const summary = {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length
    };
    
    // Calcul du score de sécurité
    let score = 100;
    score -= summary.critical * 25;
    score -= summary.high * 15;
    score -= summary.medium * 10;
    score -= summary.low * 5;
    score = Math.max(0, score);
    
    const grade = score >= 95 ? 'A+' : score >= 90 ? 'A' : score >= 80 ? 'B' : 
                  score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    
    return {
      timestamp: new Date().toISOString(),
      score,
      grade,
      summary,
      stats: this.stats,
      issues: this.issues,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Génère les recommandations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.issues.some(i => i.type === 'hardcoded_secrets')) {
      recommendations.push('Migrer tous les secrets vers des variables d\'environnement Supabase');
    }
    
    if (this.issues.some(i => i.type === 'unsafe_csp')) {
      recommendations.push('Implémenter une CSP stricte sans unsafe-inline');
    }
    
    if (this.issues.some(i => i.type === 'typescript_any')) {
      recommendations.push('Remplacer tous les types "any" par des interfaces typées');
    }
    
    if (this.issues.some(i => i.type === 'vulnerable_dependency')) {
      recommendations.push('Mettre à jour les dépendances vulnérables');
    }
    
    return recommendations;
  }

  /**
   * Affiche les résultats dans la console
   */
  displayResults(report) {
    console.log('\n📊 RÉSULTATS DE L\'AUDIT DE SÉCURITÉ');
    console.log('=====================================');
    console.log(`Score de sécurité: ${report.score}/100 (Grade ${report.grade})`);
    console.log(`Issues trouvées: ${report.stats.issuesFound}`);
    console.log(`  - Critiques: ${report.summary.critical}`);
    console.log(`  - Élevées: ${report.summary.high}`);
    console.log(`  - Moyennes: ${report.summary.medium}`);
    console.log(`  - Faibles: ${report.summary.low}`);
    
    if (report.score >= 90) {
      console.log('\n✅ SUCCÈS: Plateforme sécurisée - Production Ready!');
    } else if (report.score >= 70) {
      console.log('\n⚠️ ATTENTION: Améliorations recommandées avant production');
    } else {
      console.log('\n❌ CRITIQUE: Action immédiate requise');
    }
    
    if (report.issues.length > 0) {
      console.log('\n🔍 Issues détaillées:');
      report.issues.slice(0, 10).forEach(issue => {
        console.log(`   ${issue.severity.toUpperCase()}: ${issue.file} - ${issue.pattern.substring(0, 50)}...`);
      });
      
      if (report.issues.length > 10) {
        console.log(`   ... et ${report.issues.length - 10} autres issues`);
      }
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommandations:');
      report.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }
  }

  /**
   * Sauvegarde le rapport
   */
  saveReport(report) {
    const reportFile = path.join(REPORT_DIR, `security-audit-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé: ${reportFile}`);
    
    // Mettre à jour le log
    const logs = this.loadLogs();
    logs.push({
      timestamp: report.timestamp,
      score: report.score,
      grade: report.grade,
      issuesCount: report.stats.issuesFound,
      reportFile
    });
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  }

  /**
   * Utilitaires
   */
  ensureReportDirectory() {
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
  }

  loadLogs() {
    try {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    } catch {
      return [];
    }
  }

  getSeverity(category) {
    const severityMap = {
      hardcoded_secrets: 'critical',
      unsafe_csp: 'critical',
      typescript_any: 'medium',
      insecure_patterns: 'high',
      vulnerable_dependency: 'high'
    };
    return severityMap[category] || 'low';
  }

  getRecommendation(category) {
    const recommendations = {
      hardcoded_secrets: 'Utiliser des variables d\'environnement ou secrets Supabase',
      unsafe_csp: 'Supprimer unsafe-inline et utiliser des nonces/hashes',
      typescript_any: 'Définir des interfaces TypeScript strictes',
      insecure_patterns: 'Éviter les patterns dangereux (eval, innerHTML)',
      vulnerable_dependency: 'Mettre à jour vers une version sécurisée'
    };
    return recommendations[category] || 'Réviser selon les meilleures pratiques';
  }

  getLineNumber(content, pattern) {
    const lines = content.substring(0, content.indexOf(pattern)).split('\n');
    return lines.length;
  }

  async walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.walkDirectory(fullPath, callback);
      } else {
        callback(fullPath);
      }
    }
  }

  async applyFixes() {
    console.log('\n🔧 Application des corrections automatiques...');
    
    // Ici on pourrait implémenter des corrections automatiques
    // Pour l'instant, on log les actions possibles
    
    const fixableIssues = this.issues.filter(issue => 
      ['typescript_any', 'unsafe_csp'].includes(issue.type)
    );
    
    console.log(`   ${fixableIssues.length} issues peuvent être corrigées automatiquement`);
    console.log('   (Implémentation des corrections en cours de développement)');
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  const auditor = new SecurityAuditor();
  
  try {
    await auditor.runAudit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécution si script appelé directement
if (require.main === module) {
  main();
}

module.exports = SecurityAuditor;