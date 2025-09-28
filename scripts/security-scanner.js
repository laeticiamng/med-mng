#!/usr/bin/env node
/**
 * 🔒 SCANNER DE SÉCURITÉ - DÉTECTION DE CREDENTIALS HARDCODÉS
 * 
 * Script automatisé pour détecter les credentials et clés sensibles dans le code source
 * Usage: node scripts/security-scanner.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns de détection des credentials sensibles
const SECURITY_PATTERNS = [
  {
    name: 'Credentials with fallbacks',
    regex: /Deno\.env\.get\(.+\)\s*\|\|\s*['"][^'"]+['"]/g,
    severity: 'CRITICAL',
    description: 'Variable d\'environnement avec fallback hardcodé'
  },
  {
    name: 'Direct credentials',
    regex: /(?i)(password|secret|key|token|username|api)[^=]{0,20}=\s*['"][^'"]{10,}['"]/g,
    severity: 'HIGH',
    description: 'Credential directement assigné dans le code'
  },
  {
    name: 'JWT Tokens',
    regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[A-Za-z0-9_-]+/g,
    severity: 'CRITICAL',
    description: 'Token JWT hardcodé'
  },
  {
    name: 'Email credentials',
    regex: /(laeticia\.moto-ngane|Aiciteal1)/g,
    severity: 'CRITICAL',
    description: 'Credentials CAS spécifiques hardcodés'
  },
  {
    name: 'API URLs with tokens',
    regex: /https:\/\/[^\/]+\/[^'"]*[A-Za-z0-9_-]{20,}/g,
    severity: 'MEDIUM',
    description: 'URL contenant potentiellement un token'
  }
];

// Fichiers à exclure du scan
const EXCLUDED_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.git/**',
  '*.log',
  'package-lock.json',
  'bun.lockb',
  '*.md', // Exclure les documentations
  'scripts/security-scanner.js' // S'exclure lui-même
];

// Fichiers à inclure (priorité haute)
const INCLUDED_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'supabase/functions/**/*.ts',
  'scripts/**/*.{js,ts}',
  '*.{ts,js,jsx,tsx}',
  '.env*'
];

class SecurityScanner {
  constructor() {
    this.results = [];
    this.stats = {
      filesScanned: 0,
      issuesFound: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0
    };
  }

  /**
   * Scan tous les fichiers du projet
   */
  async scanProject() {
    console.log('🔒 SCAN DE SÉCURITÉ - DÉTECTION DE CREDENTIALS');
    console.log('==============================================\n');

    const filesToScan = this.getFilesToScan();
    
    for (const filePath of filesToScan) {
      await this.scanFile(filePath);
    }

    this.generateReport();
  }

  /**
   * Récupère la liste des fichiers à scanner
   */
  getFilesToScan() {
    const allFiles = new Set();

    // Ajouter les fichiers inclus
    for (const pattern of INCLUDED_PATTERNS) {
      const files = glob.sync(pattern, { ignore: EXCLUDED_PATTERNS });
      files.forEach(file => allFiles.add(file));
    }

    return Array.from(allFiles).filter(file => {
      // Vérifier que le fichier existe et est lisible
      try {
        fs.accessSync(file, fs.constants.R_OK);
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Scan un fichier spécifique
   */
  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.stats.filesScanned++;

      for (const pattern of SECURITY_PATTERNS) {
        const matches = [...content.matchAll(pattern.regex)];
        
        for (const match of matches) {
          const lineNumber = this.getLineNumber(content, match.index);
          const issue = {
            file: filePath,
            line: lineNumber,
            pattern: pattern.name,
            severity: pattern.severity,
            description: pattern.description,
            match: this.maskSensitiveData(match[0]),
            fullMatch: match[0]
          };

          this.results.push(issue);
          this.stats.issuesFound++;
          
          switch (pattern.severity) {
            case 'CRITICAL':
              this.stats.criticalIssues++;
              break;
            case 'HIGH':
              this.stats.highIssues++;
              break;
            case 'MEDIUM':
              this.stats.mediumIssues++;
              break;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur lecture fichier ${filePath}:`, error.message);
    }
  }

  /**
   * Trouve le numéro de ligne d'un match
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Masque les données sensibles pour l'affichage
   */
  maskSensitiveData(text) {
    if (text.length <= 10) return text;
    
    const start = text.substring(0, 6);
    const end = text.substring(text.length - 4);
    const middle = '*'.repeat(Math.min(20, text.length - 10));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Génère le rapport final
   */
  generateReport() {
    console.log('\n📊 RÉSULTATS DU SCAN DE SÉCURITÉ');
    console.log('================================\n');

    // Statistiques globales
    console.log(`📁 Fichiers scannés: ${this.stats.filesScanned}`);
    console.log(`🚨 Issues trouvées: ${this.stats.issuesFound}`);
    console.log(`🔴 Critiques: ${this.stats.criticalIssues}`);
    console.log(`🟠 Élevées: ${this.stats.highIssues}`);
    console.log(`🟡 Moyennes: ${this.stats.mediumIssues}\n`);

    if (this.results.length === 0) {
      console.log('✅ AUCUN PROBLÈME DE SÉCURITÉ DÉTECTÉ !');
      console.log('Le code source est sécurisé.\n');
      return;
    }

    // Grouper par fichier
    const byFile = this.groupByFile();
    
    for (const [file, issues] of Object.entries(byFile)) {
      console.log(`📄 ${file}`);
      console.log('─'.repeat(file.length + 2));
      
      for (const issue of issues) {
        const emoji = this.getSeverityEmoji(issue.severity);
        console.log(`  ${emoji} Ligne ${issue.line}: ${issue.description}`);
        console.log(`     Match: ${issue.match}`);
        console.log(`     Type: ${issue.pattern} (${issue.severity})\n`);
      }
    }

    // Recommandations
    this.generateRecommendations();

    // Status final
    if (this.stats.criticalIssues > 0) {
      console.log('🚨 STATUT: CRITIQUE - Correction immédiate requise !');
      process.exit(1);
    } else if (this.stats.highIssues > 0) {
      console.log('⚠️  STATUT: ATTENTION - Correction recommandée');
      process.exit(1);
    } else {
      console.log('✅ STATUT: ACCEPTABLE - Surveillance recommandée');
    }
  }

  /**
   * Groupe les résultats par fichier
   */
  groupByFile() {
    const byFile = {};
    
    for (const issue of this.results) {
      if (!byFile[issue.file]) {
        byFile[issue.file] = [];
      }
      byFile[issue.file].push(issue);
    }

    // Trier par sévérité dans chaque fichier
    for (const file of Object.keys(byFile)) {
      byFile[file].sort((a, b) => {
        const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    }

    return byFile;
  }

  /**
   * Retourne l'emoji pour le niveau de sévérité
   */
  getSeverityEmoji(severity) {
    const emojis = {
      'CRITICAL': '🔴',
      'HIGH': '🟠', 
      'MEDIUM': '🟡'
    };
    return emojis[severity] || '⚪';
  }

  /**
   * Génère les recommandations de correction
   */
  generateRecommendations() {
    console.log('🔧 RECOMMANDATIONS DE CORRECTION');
    console.log('===============================\n');

    if (this.stats.criticalIssues > 0) {
      console.log('🚨 ACTIONS CRITIQUES:');
      console.log('1. Supprimer TOUS les credentials hardcodés immédiatement');
      console.log('2. Remplacer par des variables d\'environnement');
      console.log('3. Valider la présence des variables au démarrage');
      console.log('4. Masquer les credentials dans les logs\n');
    }

    console.log('📋 PATTERN SÉCURISÉ À SUIVRE:');
    console.log('```typescript');
    console.log('// ❌ DANGEREUX');
    console.log('const API_KEY = "sk-1234567890abcdef"');
    console.log('const USERNAME = Deno.env.get("USER") || "admin@example.com"');
    console.log('');
    console.log('// ✅ SÉCURISÉ');
    console.log('const API_KEY = Deno.env.get("API_KEY")');
    console.log('if (!API_KEY) {');
    console.log('  throw new Error("API_KEY manquant - variable d\'environnement requise")');
    console.log('}');
    console.log('```\n');

    console.log('📖 DOCUMENTATION:');
    console.log('- Voir docs/SECURITY_AUDIT_COMPLETE.md pour plus de détails');
    console.log('- Configurer les variables d\'environnement selon .env.example\n');
  }

  /**
   * Sauvegarde le rapport en JSON
   */
  saveReportJson() {
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      issues: this.results
    };

    const reportPath = `security-scan-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`💾 Rapport détaillé sauvegardé: ${reportPath}`);
  }
}

// Exécution du scanner
async function main() {
  const scanner = new SecurityScanner();
  await scanner.scanProject();
  scanner.saveReportJson();
}

// Lancement si script principal
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur du scanner:', error);
    process.exit(1);
  });
}

module.exports = { SecurityScanner };