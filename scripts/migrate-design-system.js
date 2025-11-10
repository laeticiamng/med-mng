#!/usr/bin/env node

/**
 * 🎨 Design System Migration Script
 * 
 * Scanne tous les fichiers .tsx et remplace les couleurs hardcodées
 * par les tokens sémantiques du design system MED-MNG
 * 
 * Usage:
 *   node scripts/migrate-design-system.js              # Dry run (aperçu)
 *   node scripts/migrate-design-system.js --apply      # Appliquer les changements
 *   node scripts/migrate-design-system.js --file path  # Un seul fichier
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 🎨 Mapping des patterns de couleurs hardcodées → tokens sémantiques
const COLOR_MIGRATIONS = {
  // Texte blanc/noir
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  
  // Backgrounds blanc/noir
  'bg-white': 'bg-card',
  'bg-black': 'bg-background',
  'bg-white/95': 'bg-card/95',
  'bg-white/90': 'bg-card/90',
  'bg-white/80': 'bg-card/80',
  'bg-black/50': 'bg-background/50',
  'bg-black/80': 'bg-background/80',
  
  // Couleurs de statut - Rouge (Destructive)
  'text-red-600': 'text-destructive',
  'text-red-500': 'text-destructive',
  'text-red-700': 'text-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-red-500': 'bg-destructive',
  'bg-red-100': 'bg-destructive/10',
  'border-red-500': 'border-destructive',
  'hover:bg-red-700': 'hover:bg-destructive/90',
  'hover:text-red-600': 'hover:text-destructive',
  
  // Couleurs de statut - Vert (Success)
  'text-green-600': 'text-success',
  'text-green-500': 'text-success',
  'text-green-700': 'text-success',
  'bg-green-600': 'bg-success',
  'bg-green-500': 'bg-success',
  'bg-green-700': 'bg-success',
  'bg-green-100': 'bg-success/10',
  'border-green-500': 'border-success',
  'hover:bg-green-700': 'hover:bg-success/90',
  
  // Couleurs de statut - Jaune (Warning)
  'text-yellow-600': 'text-warning',
  'text-yellow-500': 'text-warning',
  'bg-yellow-600': 'bg-warning',
  'bg-yellow-500': 'bg-warning',
  'bg-yellow-100': 'bg-warning/10',
  'border-yellow-500': 'border-warning',
  
  // Couleurs primaires - Bleu
  'text-blue-600': 'text-primary',
  'text-blue-500': 'text-primary',
  'text-blue-700': 'text-primary',
  'bg-blue-600': 'bg-primary',
  'bg-blue-500': 'bg-primary',
  'bg-blue-700': 'bg-primary',
  'bg-blue-100': 'bg-primary/10',
  'border-blue-500': 'border-primary',
  'hover:bg-blue-600': 'hover:bg-primary/90',
  'hover:text-blue-600': 'hover:text-primary',
  'text-blue-200': 'text-primary-foreground/70',
  
  // Couleurs grises - Muted
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'text-gray-400': 'text-muted-foreground/80',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-500': 'bg-muted',
  'border-gray-300': 'border-border',
  'border-gray-200': 'border-border',
  'hover:bg-gray-50': 'hover:bg-muted',
  'hover:bg-gray-100': 'hover:bg-muted',
  
  // Couleurs secondaires - Orange
  'text-orange-600': 'text-warning',
  'text-orange-500': 'text-warning',
  'bg-orange-600': 'bg-warning',
  'bg-orange-500': 'bg-warning',
  'bg-orange-100': 'bg-warning/10',
  
  // Couleurs accent - Purple
  'text-purple-600': 'text-accent',
  'text-purple-500': 'text-accent',
  'bg-purple-600': 'bg-accent',
  'bg-purple-500': 'bg-accent',
  
  // Couleurs Emerald (souvent utilisé pour success)
  'text-emerald-600': 'text-success',
  'border-emerald-200': 'border-success/20',
  'hover:text-emerald-600': 'hover:text-success',
  
  // Bordures spécifiques
  'border-amber-200': 'border-border',
  'border-t': 'border-t border-border',
  'border-b': 'border-b border-border',
  
  // Gradients fixes
  'from-blue-500': 'from-primary',
  'to-blue-600': 'to-primary',
  'from-purple-600': 'from-accent',
  'to-blue-600': 'to-primary',
  'from-green-500': 'from-success',
  'to-emerald-600': 'to-success',
};

// 🔍 Patterns spéciaux nécessitant une regex
const REGEX_PATTERNS = [
  // Gradients complexes
  {
    pattern: /bg-gradient-to-r from-purple-600 to-blue-600 text-white/g,
    replacement: 'bg-gradient-medical text-primary-foreground'
  },
  {
    pattern: /bg-gradient-to-br from-blue-500 to-purple-500/g,
    replacement: 'bg-gradient-to-br from-primary to-accent'
  },
  // Opacités text-white
  {
    pattern: /text-white\/(\d+)/g,
    replacement: 'text-primary-foreground/$1'
  },
];

// 📊 Statistiques globales
const stats = {
  filesScanned: 0,
  filesModified: 0,
  totalReplacements: 0,
  replacementsByPattern: {},
  errors: []
};

/**
 * Scanne un fichier et effectue les remplacements
 */
function migrateFile(filePath, applyChanges = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileReplacements = 0;
    const changes = [];

    // Appliquer les remplacements simples
    for (const [oldPattern, newPattern] of Object.entries(COLOR_MIGRATIONS)) {
      const regex = new RegExp(`\\b${oldPattern}\\b`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        const count = matches.length;
        newContent = newContent.replace(regex, newPattern);
        fileReplacements += count;
        
        if (!stats.replacementsByPattern[oldPattern]) {
          stats.replacementsByPattern[oldPattern] = 0;
        }
        stats.replacementsByPattern[oldPattern] += count;
        
        changes.push({
          pattern: oldPattern,
          replacement: newPattern,
          count
        });
      }
    }

    // Appliquer les patterns regex
    for (const { pattern, replacement } of REGEX_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        const count = matches.length;
        newContent = newContent.replace(pattern, replacement);
        fileReplacements += count;
        
        changes.push({
          pattern: pattern.toString(),
          replacement,
          count
        });
      }
    }

    // Si des changements ont été faits
    if (fileReplacements > 0) {
      stats.filesModified++;
      stats.totalReplacements += fileReplacements;

      if (applyChanges) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ ${filePath} - ${fileReplacements} remplacements appliqués`);
      } else {
        console.log(`📝 ${filePath} - ${fileReplacements} remplacements détectés`);
      }

      // Afficher les détails
      changes.forEach(({ pattern, replacement, count }) => {
        console.log(`   ${pattern} → ${replacement} (${count}x)`);
      });
    }

    stats.filesScanned++;
    return fileReplacements;

  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Erreur sur ${filePath}: ${error.message}`);
    return 0;
  }
}

/**
 * Génère un rapport détaillé
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RAPPORT DE MIGRATION - DESIGN SYSTEM');
  console.log('='.repeat(80));
  
  console.log(`\n📁 Fichiers scannés: ${stats.filesScanned}`);
  console.log(`✏️  Fichiers modifiés: ${stats.filesModified}`);
  console.log(`🔄 Total remplacements: ${stats.totalReplacements}`);
  
  if (Object.keys(stats.replacementsByPattern).length > 0) {
    console.log('\n🎨 Remplacements par pattern:');
    const sortedPatterns = Object.entries(stats.replacementsByPattern)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20); // Top 20

    sortedPatterns.forEach(([pattern, count]) => {
      const newPattern = COLOR_MIGRATIONS[pattern];
      console.log(`   ${pattern.padEnd(30)} → ${newPattern.padEnd(30)} (${count}x)`);
    });

    if (Object.keys(stats.replacementsByPattern).length > 20) {
      console.log(`   ... et ${Object.keys(stats.replacementsByPattern).length - 20} autres patterns`);
    }
  }

  if (stats.errors.length > 0) {
    console.log(`\n❌ Erreurs (${stats.errors.length}):`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Sauvegarde un rapport JSON
 */
function saveReport(applyChanges) {
  const reportPath = path.join(__dirname, '../migration-report.json');
  const report = {
    date: new Date().toISOString(),
    mode: applyChanges ? 'applied' : 'dry-run',
    stats,
    migrations: COLOR_MIGRATIONS,
    summary: {
      filesScanned: stats.filesScanned,
      filesModified: stats.filesModified,
      totalReplacements: stats.totalReplacements,
      errorCount: stats.errors.length
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const applyChanges = args.includes('--apply');
  const singleFile = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

  console.log('🎨 Design System Migration Tool');
  console.log('================================\n');

  if (singleFile) {
    console.log(`Mode: Fichier unique (${singleFile})`);
    console.log(`Action: ${applyChanges ? 'APPLIQUER' : 'DRY RUN'}\n`);
    
    migrateFile(singleFile, applyChanges);
  } else {
    console.log(`Mode: ${applyChanges ? '🔥 MIGRATION COMPLÈTE' : '👁️  DRY RUN (aperçu)'}`);
    console.log(`Cible: src/**/*.tsx\n`);

    if (!applyChanges) {
      console.log('⚠️  Mode dry-run: Aucun fichier ne sera modifié');
      console.log('   Pour appliquer les changements: node scripts/migrate-design-system.js --apply\n');
    }

    // Trouver tous les fichiers .tsx
    const files = await glob('src/**/*.tsx', { ignore: 'node_modules/**' });
    console.log(`📂 ${files.length} fichiers trouvés\n`);

    // Créer un backup si on applique les changements
    if (applyChanges) {
      console.log('💾 Création d\'un backup avant migration...');
      const backupDir = path.join(__dirname, '../.migration-backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      files.forEach(file => {
        const backupPath = path.join(backupDir, file);
        const backupDirPath = path.dirname(backupPath);
        if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
        }
        fs.copyFileSync(file, backupPath);
      });
      console.log(`✅ Backup créé dans: ${backupDir}\n`);
    }

    // Migrer tous les fichiers
    for (const file of files) {
      migrateFile(file, applyChanges);
    }
  }

  // Générer et sauvegarder le rapport
  generateReport();
  saveReport(applyChanges);

  if (!applyChanges) {
    console.log('\n💡 Pour appliquer ces changements:');
    console.log('   node scripts/migrate-design-system.js --apply');
  } else {
    console.log('\n✅ Migration terminée avec succès !');
    console.log('   Un backup a été créé dans .migration-backup/');
  }
}

// Exécution
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
