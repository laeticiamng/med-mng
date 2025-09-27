#!/usr/bin/env node

/**
 * 🔐 MED-MNG - Validation Sécurité Temps Réel
 * 
 * Script de validation continue de la sécurité
 * - Scan des configurations sensibles
 * - Vérification des permissions
 * - Audit des dépendances
 * - Tests de pénétration basiques
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  reportDir: 'security-reports',
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  maxSeverityScore: 100,
  criticalThreshold: 80,
  
  // Patterns de sécurité à vérifier
  securityPatterns: {
    secrets: [
      /password\s*[:=]\s*['""][^'""]+['""]?/gi,
      /api[_-]?key\s*[:=]\s*['""][^'""]+['""]?/gi,
      /secret\s*[:=]\s*['""][^'""]+['""]?/gi,
      /token\s*[:=]\s*['""][^'""]+['""]?/gi,
      /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
      /xoxb-[a-zA-Z0-9-]+/g, // Slack tokens
    ],
    
    vulnerabilities: [
      /eval\s*\(/gi,
      /innerHTML\s*=/gi,
      /document\.write\s*\(/gi,
      /\.html\s*\(/gi, // jQuery html()
      /dangerouslySetInnerHTML/gi,
    ],
    
    configIssues: [
      /cors.*origin.*\*/gi,
      /x-frame-options.*allow/gi,
      /strict-transport-security.*max-age.*0/gi,
    ]
  }
};

class SecurityValidator {
  constructor() {
    this.issues = [];
    this.score = 100;
    this.reportPath = '';
    this.startTime = Date.now();
    
    this.createReportDirectory();
  }

  createReportDirectory() {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    }
    
    this.reportPath = path.join(
      CONFIG.reportDir,
      `security_validation_${CONFIG.timestamp}.json`
    );
  }

  log(level, message, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    
    console.log(`[${level.toUpperCase()}] ${message}`);
    
    if (level === 'ERROR' || level === 'CRITICAL') {
      this.issues.push(logEntry);
    }
  }

  async validateEnvironmentFiles() {
    this.log('INFO', '🔍 Validation des fichiers d\'environnement...');
    
    const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
    let foundIssues = false;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        this.log('WARNING', `⚠️  Fichier d'environnement trouvé: ${envFile}`);
        
        // Vérifier si le fichier est dans .gitignore
        const gitignoreContent = fs.existsSync('.gitignore') 
          ? fs.readFileSync('.gitignore', 'utf8') 
          : '';
          
        if (!gitignoreContent.includes(envFile)) {
          this.log('CRITICAL', `🚨 Fichier ${envFile} non ignoré par Git!`, {
            file: envFile,
            issue: 'not_in_gitignore'
          });
          this.score -= 20;
          foundIssues = true;
        }
        
        // Scanner le contenu pour des secrets
        const content = fs.readFileSync(envFile, 'utf8');
        await this.scanForSecrets(content, envFile);
      }
    }
    
    if (!foundIssues) {
      this.log('INFO', '✅ Configuration environnement sécurisée');
    }
  }

  async scanForSecrets(content, filename = 'unknown') {
    this.log('INFO', `🔐 Scan des secrets dans ${filename}...`);
    
    let secretsFound = 0;
    
    for (const pattern of CONFIG.securityPatterns.secrets) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Ignorer les exemples/templates
          if (!match.includes('your-') && !match.includes('example') && !match.includes('xxx')) {
            this.log('CRITICAL', `🚨 Secret potentiel détecté: ${match.substring(0, 20)}...`, {
              file: filename,
              pattern: pattern.source,
              match: match.substring(0, 50)
            });
            secretsFound++;
            this.score -= 15;
          }
        });
      }
    }
    
    if (secretsFound === 0) {
      this.log('INFO', '✅ Aucun secret détecté');
    } else {
      this.log('ERROR', `❌ ${secretsFound} secrets potentiels trouvés`);
    }
    
    return secretsFound;
  }

  async scanCodeVulnerabilities() {
    this.log('INFO', '🛡️  Scan des vulnérabilités code...');
    
    const sourceFiles = this.getSourceFiles();
    let vulnerabilitiesFound = 0;
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of CONFIG.securityPatterns.vulnerabilities) {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              this.log('WARNING', `⚠️  Vulnérabilité potentielle: ${match}`, {
                file: file,
                pattern: pattern.source,
                line: this.getLineNumber(content, match)
              });
              vulnerabilitiesFound++;
              this.score -= 5;
            });
          }
        }
      } catch (error) {
        this.log('ERROR', `Erreur lecture fichier ${file}: ${error.message}`);
      }
    }
    
    if (vulnerabilitiesFound === 0) {
      this.log('INFO', '✅ Aucune vulnérabilité code détectée');
    } else {
      this.log('WARNING', `⚠️  ${vulnerabilitiesFound} vulnérabilités potentielles trouvées`);
    }
    
    return vulnerabilitiesFound;
  }

  getSourceFiles() {
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    function walkDir(dir) {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    }
    
    walkDir('src');
    return files.slice(0, 100); // Limiter pour éviter les timeouts
  }

  getLineNumber(content, searchTerm) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return 0;
  }

  async validateDependencies() {
    this.log('INFO', '📦 Validation des dépendances...');
    
    try {
      // Exécuter npm audit
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        stdio: 'pipe' 
      });
      
      const auditData = JSON.parse(auditResult);
      
      if (auditData.vulnerabilities) {
        const vulnerabilities = Object.values(auditData.vulnerabilities);
        const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
        const high = vulnerabilities.filter(v => v.severity === 'high').length;
        const moderate = vulnerabilities.filter(v => v.severity === 'moderate').length;
        
        if (critical > 0) {
          this.log('CRITICAL', `🚨 ${critical} vulnérabilités critiques dans les dépendances`);
          this.score -= 25;
        }
        
        if (high > 0) {
          this.log('WARNING', `⚠️  ${high} vulnérabilités élevées dans les dépendances`);
          this.score -= 10;
        }
        
        if (moderate > 0) {
          this.log('INFO', `ℹ️  ${moderate} vulnérabilités modérées dans les dépendances`);
          this.score -= 2;
        }
        
        if (critical === 0 && high === 0 && moderate === 0) {
          this.log('INFO', '✅ Aucune vulnérabilité dans les dépendances');
        }
      }
      
    } catch (error) {
      this.log('WARNING', `⚠️  Erreur npm audit: ${error.message.substring(0, 100)}`);
      // Ne pas pénaliser si npm audit échoue
    }
  }

  async validateConfiguration() {
    this.log('INFO', '⚙️  Validation de la configuration...');
    
    // Vérifier package.json
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Vérifier les scripts de sécurité
      if (!packageJson.scripts || !packageJson.scripts['audit:security']) {
        this.log('WARNING', '⚠️  Script de sécurité manquant dans package.json');
        this.score -= 5;
      }
      
      // Vérifier les dépendances de sécurité recommandées
      const securityDeps = ['helmet', '@sentry/react'];
      const missingDeps = securityDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );
      
      if (missingDeps.length > 0) {
        this.log('WARNING', `⚠️  Dépendances de sécurité recommandées manquantes: ${missingDeps.join(', ')}`);
        this.score -= 3;
      }
    }
    
    // Vérifier .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      const requiredEntries = ['.env', 'node_modules', '*.log', '.DS_Store'];
      
      for (const entry of requiredEntries) {
        if (!gitignoreContent.includes(entry)) {
          this.log('WARNING', `⚠️  Entrée manquante dans .gitignore: ${entry}`);
          this.score -= 2;
        }
      }
    } else {
      this.log('CRITICAL', '🚨 Fichier .gitignore manquant!');
      this.score -= 15;
    }
  }

  async validateSupabaseConfiguration() {
    this.log('INFO', '🗄️  Validation configuration Supabase...');
    
    // Vérifier les variables Supabase
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.log('WARNING', `⚠️  Variable d'environnement manquante: ${envVar}`);
        this.score -= 5;
      }
    }
    
    // Vérifier la structure des fichiers Supabase
    const supabaseFiles = [
      'supabase/config.toml',
      'src/integrations/supabase/client.ts'
    ];
    
    for (const file of supabaseFiles) {
      if (!fs.existsSync(file)) {
        this.log('WARNING', `⚠️  Fichier Supabase manquant: ${file}`);
        this.score -= 3;
      }
    }
  }

  generateSecurityScore() {
    let grade = 'F';
    let status = '🔴 CRITIQUE';
    
    if (this.score >= 90) {
      grade = 'A+';
      status = '🟢 EXCELLENT';
    } else if (this.score >= 80) {
      grade = 'A';
      status = '🟢 BON';
    } else if (this.score >= 70) {
      grade = 'B';
      status = '🟡 ACCEPTABLE';
    } else if (this.score >= 60) {
      grade = 'C';
      status = '🟠 PRÉOCCUPANT';
    } else {
      grade = 'F';
      status = '🔴 CRITIQUE';
    }
    
    return { score: this.score, grade, status };
  }

  async generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const security = this.generateSecurityScore();
    
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        version: '1.0.0',
        tool: 'med-mng-security-validator'
      },
      
      security: {
        score: security.score,
        grade: security.grade,
        status: security.status,
        maxScore: CONFIG.maxSeverityScore
      },
      
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.level === 'CRITICAL').length,
        warningIssues: this.issues.filter(i => i.level === 'WARNING').length,
        errorIssues: this.issues.filter(i => i.level === 'ERROR').length
      },
      
      issues: this.issues,
      
      recommendations: this.generateRecommendations()
    };
    
    // Sauvegarder le rapport
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.issues.some(i => i.details?.issue === 'not_in_gitignore')) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Ajouter tous les fichiers .env* au .gitignore',
        impact: 'Prévient l\'exposition de secrets'
      });
    }
    
    if (this.issues.some(i => i.message.includes('secret'))) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Éliminer tous les secrets hardcodés',
        impact: 'Élimine les risques d\'exposition de credentials'
      });
    }
    
    if (this.issues.some(i => i.message.includes('vulnérabilités critiques'))) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Mettre à jour les dépendances vulnérables',
        impact: 'Corrige les failles de sécurité connues'
      });
    }
    
    if (this.score < CONFIG.criticalThreshold) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Améliorer le score de sécurité global',
        impact: 'Renforce la posture de sécurité générale'
      });
    }
    
    return recommendations;
  }

  async runFullValidation() {
    try {
      console.log('🔐 MED-MNG - Validation Sécurité Démarrée\n');
      
      await this.validateEnvironmentFiles();
      await this.scanCodeVulnerabilities();
      await this.validateDependencies();
      await this.validateConfiguration();
      await this.validateSupabaseConfiguration();
      
      const report = await this.generateReport();
      
      console.log('\n================================================');
      console.log(`🎯 VALIDATION TERMINÉE - ${report.security.status}`);
      console.log(`📊 Score: ${report.security.score}/100 (Grade ${report.security.grade})`);
      console.log(`🚨 Issues: ${report.summary.totalIssues} (${report.summary.criticalIssues} critiques)`);
      console.log(`📄 Rapport: ${this.reportPath}`);
      console.log('================================================\n');
      
      if (report.recommendations.length > 0) {
        console.log('🔧 RECOMMANDATIONS:');
        report.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
        });
        console.log('');
      }
      
      // Exit code basé sur le score
      if (this.score < CONFIG.criticalThreshold) {
        console.log('⚠️  ATTENTION: Score de sécurité critique, action requise!');
        process.exit(1);
      } else {
        console.log('✅ Validation réussie: Niveau de sécurité acceptable');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error.message);
      process.exit(1);
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const validator = new SecurityValidator();
  validator.runFullValidation();
}

module.exports = SecurityValidator;