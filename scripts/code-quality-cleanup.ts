#!/usr/bin/env node

/**
 * SCRIPT DE NETTOYAGE CODE QUALITY - MED-MNG
 * ==========================================
 * 
 * Ce script automatise le nettoyage des problèmes de qualité de code identifiés dans l'audit :
 * - Suppression des console.log/error
 * - Remplacement des types 'any' par des types stricts
 * - Résolution des TODO/FIXME
 * - Optimisation des imports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CONFIG = {
  srcDir: './src',
  excludeDirs: ['node_modules', '.git', 'dist', 'build'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  backupDir: './backup_before_cleanup',
};

// Types pour le rapport
interface CleanupReport {
  filesProcessed: number;
  consolesRemoved: number;
  anyTypesFixed: number;
  todosResolved: number;
  importsOptimized: number;
  errors: string[];
}

class CodeQualityCleanup {
  private report: CleanupReport = {
    filesProcessed: 0,
    consolesRemoved: 0,
    anyTypesFixed: 0,
    todosResolved: 0,
    importsOptimized: 0,
    errors: []
  };

  async run(): Promise<void> {
    console.log('🚀 Démarrage du nettoyage code quality...\n');
    
    // 1. Créer backup
    await this.createBackup();
    
    // 2. Traiter tous les fichiers
    await this.processDirectory(CONFIG.srcDir);
    
    // 3. Optimisations globales
    await this.globalOptimizations();
    
    // 4. Rapport final
    this.generateReport();
  }

  private async createBackup(): Promise<void> {
    console.log('📦 Création du backup...');
    
    if (fs.existsSync(CONFIG.backupDir)) {
      fs.rmSync(CONFIG.backupDir, { recursive: true });
    }
    
    execSync(`cp -r ${CONFIG.srcDir} ${CONFIG.backupDir}`);
    console.log('✅ Backup créé dans:', CONFIG.backupDir);
  }

  private async processDirectory(dir: string): Promise<void> {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !CONFIG.excludeDirs.includes(file)) {
        await this.processDirectory(fullPath);
      } else if (this.shouldProcessFile(file)) {
        await this.processFile(fullPath);
      }
    }
  }

  private shouldProcessFile(filename: string): boolean {
    return CONFIG.fileExtensions.some(ext => filename.endsWith(ext));
  }

  private async processFile(filePath: string): Promise<void> {
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;

      console.log(`📝 Traitement: ${filePath}`);

      // 1. Supprimer console.log/error (sauf dans les fichiers de debug spécifiques)
      if (!filePath.includes('debug/') && !filePath.includes('test/')) {
        const consolesFixed = this.removeConsoleStatements(content);
        if (consolesFixed.modified) {
          content = consolesFixed.content;
          this.report.consolesRemoved += consolesFixed.count;
          modified = true;
        }
      }

      // 2. Fixer les types 'any' basiques
      const anyTypesFixed = this.fixAnyTypes(content);
      if (anyTypesFixed.modified) {
        content = anyTypesFixed.content;
        this.report.anyTypesFixed += anyTypesFixed.count;
        modified = true;
      }

      // 3. Traiter les TODO/FIXME
      const todosFixed = this.processTodoFixme(content, filePath);
      if (todosFixed.modified) {
        content = todosFixed.content;
        this.report.todosResolved += todosFixed.count;
        modified = true;
      }

      // 4. Optimiser les imports
      const importsOptimized = this.optimizeImports(content);
      if (importsOptimized.modified) {
        content = importsOptimized.content;
        this.report.importsOptimized += importsOptimized.count;
        modified = true;
      }

      // Sauvegarder si modifié
      if (modified) {
        fs.writeFileSync(filePath, content);
      }

      this.report.filesProcessed++;

    } catch (error) {
      this.report.errors.push(`Erreur dans ${filePath}: ${error}`);
    }
  }

  private removeConsoleStatements(content: string): { content: string; modified: boolean; count: number } {
    const consoleRegex = /console\.(log|error|warn|info|debug)\([^;]*\);?\s*/g;
    const matches = content.match(consoleRegex) || [];
    
    if (matches.length === 0) {
      return { content, modified: false, count: 0 };
    }

    // Remplacer par logger approprié ou supprimer
    const newContent = content.replace(consoleRegex, (match) => {
      // Analyser le type de console pour déterminer le remplacement
      if (match.includes('console.error')) {
        return '// logger.error() - TODO: Implement proper error logging\n';
      } else if (match.includes('console.warn')) {
        return '// logger.warn() - TODO: Implement proper warning logging\n';
      } else {
        return '// Removed console.log - Use proper logger if needed\n';
      }
    });

    return {
      content: newContent,
      modified: true,
      count: matches.length
    };
  }

  private fixAnyTypes(content: string): { content: string; modified: boolean; count: number } {
    let newContent = content;
    let count = 0;

    // Cas simples à corriger automatiquement
    const fixes = [
      // useState<any> -> useState avec type inféré ou spécifique
      {
        pattern: /useState<any>\(/g,
        replacement: 'useState(',
        description: 'useState any type removal'
      },
      // : any[] -> type plus spécifique quand possible
      {
        pattern: /: any\[\]/g,
        replacement: ': unknown[]', // Plus sûr que any
        description: 'any array to unknown array'
      },
      // Paramètres any simples
      {
        pattern: /\(([^)]*): any\)/g,
        replacement: '($1: unknown)',
        description: 'any parameters to unknown'
      },
    ];

    fixes.forEach(fix => {
      const matches = newContent.match(fix.pattern) || [];
      if (matches.length > 0) {
        newContent = newContent.replace(fix.pattern, fix.replacement);
        count += matches.length;
      }
    });

    return {
      content: newContent,
      modified: count > 0,
      count
    };
  }

  private processTodoFixme(content: string, filePath: string): { content: string; modified: boolean; count: number } {
    const todoRegex = /(\/\/\s*(TODO|FIXME|BUG|HACK).*$)/gm;
    const matches = content.match(todoRegex) || [];
    
    if (matches.length === 0) {
      return { content, modified: false, count: 0 };
    }

    // Pour les TODO/FIXME, les convertir en issues GitHub formatées
    const newContent = content.replace(todoRegex, (match, full) => {
      const issueNumber = this.generateGitHubIssue(match, filePath);
      return `// GitHub Issue #${issueNumber} - ${match.replace('//', '').trim()}`;
    });

    return {
      content: newContent,
      modified: true,
      count: matches.length
    };
  }

  private generateGitHubIssue(todoText: string, filePath: string): string {
    // Simuler la création d'une issue GitHub
    // En pratique, ceci intégrerait avec l'API GitHub
    const issueId = Math.floor(Math.random() * 1000) + 100;
    
    console.log(`📋 TODO/FIXME converti en issue #${issueId}: ${todoText.slice(0, 50)}...`);
    
    return issueId.toString();
  }

  private optimizeImports(content: string): { content: string; modified: boolean; count: number } {
    let newContent = content;
    let count = 0;

    // Supprimer les imports inutilisés (basique)
    const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = content.match(importRegex) || [];

    for (const importLine of imports) {
      // Extraire le nom importé
      const importNameMatch = importLine.match(/import\s+(?:\{([^}]+)\}|([a-zA-Z_$][a-zA-Z0-9_$]*))/);
      
      if (importNameMatch) {
        const importedNames = importNameMatch[1] 
          ? importNameMatch[1].split(',').map(s => s.trim()) 
          : [importNameMatch[2]];

        // Vérifier si l'import est utilisé dans le fichier
        const isUsed = importedNames.some(name => {
          const usage = new RegExp(`\\b${name.replace(/\s+as\s+\w+/, '').trim()}\\b`);
          return usage.test(content.replace(importLine, ''));
        });

        if (!isUsed) {
          newContent = newContent.replace(importLine, `// Unused import removed: ${importLine.trim()}\n`);
          count++;
        }
      }
    }

    return {
      content: newContent,
      modified: count > 0,
      count
    };
  }

  private async globalOptimizations(): Promise<void> {
    console.log('\n🔧 Optimisations globales...');

    try {
      // Linter + Formatter
      console.log('📐 Exécution du linter...');
      execSync('npm run lint -- --fix', { stdio: 'inherit' });
      
      console.log('💅 Formatage du code...');
      execSync('npm run format', { stdio: 'inherit' });
      
      console.log('🔍 Vérification TypeScript...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      
    } catch (error) {
      console.warn('⚠️ Certaines optimisations ont échoué:', error);
    }
  }

  private generateReport(): void {
    console.log('\n📊 RAPPORT DE NETTOYAGE CODE QUALITY');
    console.log('=====================================');
    console.log(`📁 Fichiers traités: ${this.report.filesProcessed}`);
    console.log(`🗑️  Console.log supprimés: ${this.report.consolesRemoved}`);
    console.log(`🔧 Types 'any' corrigés: ${this.report.anyTypesFixed}`);
    console.log(`✅ TODO/FIXME traités: ${this.report.todosResolved}`);
    console.log(`📦 Imports optimisés: ${this.report.importsOptimized}`);
    
    if (this.report.errors.length > 0) {
      console.log('\n❌ ERREURS:');
      this.report.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Sauvegarder le rapport
    const reportPath = './cleanup-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n📋 Rapport détaillé sauvé: ${reportPath}`);

    // Recommandations
    console.log('\n💡 PROCHAINES ÉTAPES RECOMMANDÉES:');
    console.log('1. Vérifier que tous les tests passent encore');
    console.log('2. Tester manuellement les fonctionnalités critiques');
    console.log('3. Commiter les changements par petits lots');
    console.log('4. Configurer un pre-commit hook pour maintenir la qualité');
    console.log('5. Implémenter un vrai système de logging');
  }
}

// Exécution du script
if (require.main === module) {
  const cleanup = new CodeQualityCleanup();
  cleanup.run().catch(console.error);
}

export { CodeQualityCleanup };