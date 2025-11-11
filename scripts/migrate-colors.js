#!/usr/bin/env node

/**
 * Script de migration automatique des couleurs hardcodées vers tokens sémantiques
 * 
 * Usage:
 *   node scripts/migrate-colors.js [options]
 * 
 * Options:
 *   --path <path>    Chemin du fichier ou dossier à migrer (défaut: src/)
 *   --dry-run        Afficher les changements sans les appliquer
 *   --interactive    Mode interactif pour confirmer chaque changement
 *   --stats          Afficher uniquement les statistiques
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Mapping des couleurs hardcodées vers tokens sémantiques
const COLOR_MAPPINGS = {
  // Backgrounds
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-slate-50': 'bg-muted',
  'bg-slate-100': 'bg-muted',
  'bg-zinc-50': 'bg-muted',
  'bg-neutral-50': 'bg-muted',
  
  // Primary colors
  'bg-blue-50': 'bg-primary/10',
  'bg-blue-100': 'bg-primary/20',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-indigo-50': 'bg-primary/10',
  'bg-indigo-500': 'bg-primary',
  
  // Success colors
  'bg-green-50': 'bg-success/10',
  'bg-green-100': 'bg-success/20',
  'bg-green-500': 'bg-success',
  'bg-green-600': 'bg-success',
  'bg-emerald-50': 'bg-success/10',
  'bg-emerald-500': 'bg-success',
  
  // Destructive/Error colors
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/20',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive',
  
  // Warning colors
  'bg-yellow-50': 'bg-warning/10',
  'bg-yellow-100': 'bg-warning/20',
  'bg-yellow-500': 'bg-warning',
  'bg-yellow-600': 'bg-warning',
  'bg-amber-50': 'bg-warning/10',
  'bg-amber-100': 'bg-warning/20',
  'bg-amber-500': 'bg-warning',
  'bg-amber-600': 'bg-warning',
  'bg-orange-50': 'bg-warning/10',
  'bg-orange-100': 'bg-warning/20',
  'bg-orange-500': 'bg-warning',
  'bg-orange-600': 'bg-warning',
  
  // Accent colors
  'bg-purple-50': 'bg-accent/10',
  'bg-purple-100': 'bg-accent/20',
  'bg-purple-500': 'bg-accent',
  'bg-purple-600': 'bg-accent',
  'bg-violet-50': 'bg-accent/10',
  'bg-violet-500': 'bg-accent',
  
  // Text colors
  'text-white': 'text-foreground',
  'text-black': 'text-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-600': 'text-muted-foreground',
  
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-indigo-500': 'text-primary',
  
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-emerald-500': 'text-success',
  'text-green-800': 'text-success',
  
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  
  'text-yellow-600': 'text-warning',
  'text-amber-600': 'text-warning',
  'text-amber-900': 'text-warning-foreground',
  'text-orange-600': 'text-warning',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-slate-200': 'border-border',
  
  'border-blue-200': 'border-primary/20',
  'border-blue-500': 'border-primary',
  
  'border-green-200': 'border-success/20',
  'border-green-500': 'border-success',
  
  'border-red-200': 'border-destructive/20',
  'border-red-500': 'border-destructive',
  
  'border-yellow-200': 'border-warning/20',
  'border-amber-200': 'border-warning/20',
  'border-orange-200': 'border-warning/20',
  
  // Special cases with dark mode
  'dark:bg-green-900/20': '',
  'dark:text-green-400': '',
  'dark:bg-blue-900/20': '',
  'dark:text-blue-400': '',
  'dark:bg-red-900/20': '',
  'dark:text-red-400': '',
  'dark:bg-amber-900/20': '',
  'dark:text-amber-400': '',
  'dark:bg-orange-900/20': '',
  'dark:text-orange-400': '',
  'dark:bg-purple-900/20': '',
  'dark:text-purple-400': '',
};

// Options par défaut
const options = {
  path: 'src/',
  dryRun: false,
  interactive: false,
  stats: false,
};

// Parser les arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--interactive') {
    options.interactive = true;
  } else if (arg === '--stats') {
    options.stats = true;
  } else if (arg === '--path' && args[i + 1]) {
    options.path = args[++i];
  }
}

// Statistiques
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  totalReplacements: 0,
  replacementsByColor: {},
};

/**
 * Migrer un fichier
 */
function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  let hasChanges = false;
  const changes = [];

  // Pour chaque mapping
  for (const [hardcodedColor, semanticToken] of Object.entries(COLOR_MAPPINGS)) {
    // Créer une regex pour capturer la couleur dans className
    const regex = new RegExp(
      `(className=["'\`][^"'\`]*)${escapeRegex(hardcodedColor)}([^"'\`]*["'\`])`,
      'g'
    );

    let match;
    const originalModified = modified;
    
    while ((match = regex.exec(originalModified)) !== null) {
      const fullMatch = match[0];
      const prefix = match[1];
      const suffix = match[2];
      
      // Si le token de remplacement est vide (dark mode), on supprime juste la classe
      let replacement;
      if (semanticToken === '') {
        // Supprimer la classe et l'espace avant/après
        replacement = fullMatch.replace(` ${hardcodedColor}`, '').replace(`${hardcodedColor} `, '');
      } else {
        replacement = `${prefix}${semanticToken}${suffix}`;
      }
      
      modified = modified.replace(fullMatch, replacement);
      hasChanges = true;
      
      changes.push({
        line: content.substring(0, match.index).split('\n').length,
        from: hardcodedColor,
        to: semanticToken || '(removed)',
      });
      
      // Statistiques
      stats.totalReplacements++;
      stats.replacementsByColor[hardcodedColor] = 
        (stats.replacementsByColor[hardcodedColor] || 0) + 1;
    }
  }

  stats.totalFiles++;
  
  if (hasChanges) {
    stats.modifiedFiles++;
    
    if (!options.stats) {
      console.log(`\n📝 ${filePath}`);
      changes.forEach(change => {
        console.log(`   Ligne ${change.line}: ${change.from} → ${change.to}`);
      });
    }
    
    if (!options.dryRun && !options.interactive) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      if (!options.stats) {
        console.log('   ✅ Fichier mis à jour');
      }
    } else if (options.interactive) {
      // TODO: Implémenter le mode interactif avec prompt
      console.log('   ⏭️  Mode interactif non encore implémenté');
    }
  }
  
  return hasChanges;
}

/**
 * Échapper les caractères spéciaux pour regex
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scanner un dossier récursivement
 */
async function scanDirectory(dirPath) {
  const pattern = path.join(dirPath, '**/*.{tsx,ts,jsx,js}');
  const files = await glob(pattern, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/build/**']
  });

  console.log(`🔍 Scanning ${files.length} fichiers dans ${dirPath}...\n`);

  for (const file of files) {
    migrateFile(file);
  }
}

/**
 * Afficher les statistiques
 */
function displayStats() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 STATISTIQUES DE MIGRATION');
  console.log('='.repeat(60));
  console.log(`\n📁 Fichiers analysés:     ${stats.totalFiles}`);
  console.log(`✏️  Fichiers modifiés:     ${stats.modifiedFiles}`);
  console.log(`🔄 Total remplacements:   ${stats.totalReplacements}`);
  
  if (Object.keys(stats.replacementsByColor).length > 0) {
    console.log('\n📈 Top 10 couleurs remplacées:');
    const sorted = Object.entries(stats.replacementsByColor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sorted.forEach(([color, count], index) => {
      console.log(`   ${index + 1}. ${color.padEnd(20)} → ${count} fois`);
    });
  }
  
  if (options.dryRun) {
    console.log('\n⚠️  Mode DRY-RUN: Aucun fichier n\'a été modifié');
    console.log('   Exécutez sans --dry-run pour appliquer les changements');
  }
  
  console.log('\n' + '='.repeat(60));
}

/**
 * Main
 */
async function main() {
  console.log('🎨 Migration des couleurs hardcodées vers tokens sémantiques\n');
  
  if (options.dryRun) {
    console.log('⚠️  Mode DRY-RUN activé (aucune modification ne sera appliquée)\n');
  }
  
  const targetPath = options.path;
  
  // Vérifier si le chemin existe
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Erreur: Le chemin "${targetPath}" n'existe pas`);
    process.exit(1);
  }
  
  // Déterminer si c'est un fichier ou un dossier
  const stat = fs.statSync(targetPath);
  
  if (stat.isFile()) {
    migrateFile(targetPath);
  } else if (stat.isDirectory()) {
    await scanDirectory(targetPath);
  }
  
  displayStats();
  
  if (stats.modifiedFiles > 0 && !options.dryRun) {
    console.log('\n✅ Migration terminée avec succès!');
  } else if (stats.modifiedFiles === 0) {
    console.log('\n✨ Aucune couleur hardcodée trouvée. Votre code est déjà conforme!');
  }
}

// Exécuter
main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
