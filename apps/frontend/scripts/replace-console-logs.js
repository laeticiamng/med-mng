#!/usr/bin/env node

/**
 * Script pour remplacer tous les console.log/warn/error/debug par logger
 * Usage: node scripts/replace-console-logs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const loggerImport = "import logger from '@/lib/logger';";

// Fichiers à exclure
const excludePatterns = [
  'lib/logger.ts',  // Le logger lui-même
  'tests/',         // Tests peuvent utiliser console
  '.test.',         // Fichiers de test
  '.spec.',         // Fichiers de test
];

// Stats
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: {
    'console.log': 0,
    'console.debug': 0,
    'console.info': 0,
    'console.warn': 0,
    'console.error': 0,
  },
  importsAdded: 0,
};

/**
 * Vérifier si un fichier doit être exclu
 */
function shouldExclude(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Vérifier si le fichier a déjà l'import logger
 */
function hasLoggerImport(content) {
  return content.includes("from '@/lib/logger'") ||
         content.includes('from "@/lib/logger"');
}

/**
 * Ajouter l'import logger au début du fichier
 */
function addLoggerImport(content) {
  const lines = content.split('\n');

  // Trouver la dernière ligne d'import
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('import{')) {
      lastImportIndex = i;
    }
    // Arrêter après la première ligne qui n'est pas un import/commentaire/ligne vide
    if (lastImportIndex !== -1 &&
        !lines[i].trim().startsWith('import') &&
        !lines[i].trim().startsWith('//') &&
        !lines[i].trim().startsWith('/*') &&
        !lines[i].trim().startsWith('*') &&
        lines[i].trim() !== '') {
      break;
    }
  }

  // Insérer après la dernière ligne d'import
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, loggerImport);
  } else {
    // Pas d'imports, ajouter au début
    lines.unshift(loggerImport, '');
  }

  stats.importsAdded++;
  return lines.join('\n');
}

/**
 * Remplacer les console.* par logger.*
 */
function replaceConsoleLogs(content) {
  let modified = content;
  let hasChanges = false;

  // Remplacements à effectuer
  const replacements = [
    { from: /console\.log\(/g, to: 'logger.debug(', key: 'console.log' },
    { from: /console\.debug\(/g, to: 'logger.debug(', key: 'console.debug' },
    { from: /console\.info\(/g, to: 'logger.info(', key: 'console.info' },
    { from: /console\.warn\(/g, to: 'logger.warn(', key: 'console.warn' },
    { from: /console\.error\(/g, to: 'logger.error(', key: 'console.error' },
  ];

  replacements.forEach(({ from, to, key }) => {
    const matches = modified.match(from);
    if (matches) {
      stats.replacements[key] += matches.length;
      modified = modified.replace(from, to);
      hasChanges = true;
    }
  });

  return { content: modified, hasChanges };
}

/**
 * Traiter un fichier
 */
function processFile(filePath) {
  stats.filesProcessed++;

  const content = fs.readFileSync(filePath, 'utf8');

  // Remplacer les console.*
  const { content: newContent, hasChanges } = replaceConsoleLogs(content);

  if (!hasChanges) {
    return; // Rien à faire
  }

  // Ajouter l'import si nécessaire
  let finalContent = newContent;
  if (!hasLoggerImport(newContent)) {
    finalContent = addLoggerImport(newContent);
  }

  // Écrire le fichier modifié
  fs.writeFileSync(filePath, finalContent, 'utf8');
  stats.filesModified++;

  console.log(`✓ Modified: ${path.relative(srcDir, filePath)}`);
}

/**
 * Parcourir récursivement les fichiers
 */
function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      !shouldExclude(filePath)
    ) {
      processFile(filePath);
    }
  });
}

/**
 * Main
 */
console.log('🔍 Searching for console.* usage...\n');

walkDir(srcDir);

console.log('\n📊 Summary:');
console.log(`   Files processed: ${stats.filesProcessed}`);
console.log(`   Files modified: ${stats.filesModified}`);
console.log(`   Imports added: ${stats.importsAdded}`);
console.log('\n   Replacements:');
Object.entries(stats.replacements).forEach(([key, count]) => {
  if (count > 0) {
    console.log(`   - ${key}: ${count}`);
  }
});

const totalReplacements = Object.values(stats.replacements).reduce((a, b) => a + b, 0);
console.log(`\n✅ Total replacements: ${totalReplacements}`);

if (stats.filesModified === 0) {
  console.log('\n✨ No console.* usage found! Code is clean.');
} else {
  console.log('\n✨ Done! Run "pnpm run lint" to verify.');
}
