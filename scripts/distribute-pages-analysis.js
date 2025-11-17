#!/usr/bin/env node
/**
 * Script de répartition automatique des pages en groupes d'analyse
 *
 * Ce script :
 * 1. Détecte automatiquement toutes les pages du repo (front + back + functions)
 * 2. Calcule le nombre total de pages
 * 3. Divise ce total en N groupes égaux (configurable)
 * 4. Génère un fichier JSON avec la répartition complète
 *
 * Chaque page apparaît exactement une fois, aucune duplication, aucun oubli.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==================== CONFIGURATION ====================
// Nombre de groupes souhaités (MODIFIABLE)
const NUMBER_OF_GROUPS = 10;

// Chemins à scanner
const PATHS_TO_SCAN = [
  'apps/frontend/src/pages',     // Pages React frontend
  'apps/functions',               // Fonctions serverless
  'apps/backend/src',            // Routes backend
];

// Extensions de fichiers à inclure
const VALID_EXTENSIONS = ['.ts', '.tsx'];

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Détermine la catégorie d'un fichier selon son chemin
 */
function getCategoryFromPath(filePath) {
  if (filePath.includes('apps/frontend')) return 'frontend';
  if (filePath.includes('apps/backend')) return 'backend';
  if (filePath.includes('apps/functions')) return 'functions';
  return 'frontend'; // Par défaut
}

/**
 * Extrait le nom lisible d'un fichier
 */
function getPageName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Scanner récursif de fichiers
 */
async function scanDirectory(dirPath, baseDir) {
  const pages = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Ignorer node_modules et autres dossiers non pertinents
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
          continue;
        }
        // Scanner récursivement
        const subPages = await scanDirectory(fullPath, baseDir);
        pages.push(...subPages);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (VALID_EXTENSIONS.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          pages.push({
            path: fullPath,
            relativePath,
            category: getCategoryFromPath(fullPath),
            name: getPageName(entry.name),
          });
        }
      }
    }
  } catch (error) {
    console.error(`Erreur lors du scan de ${dirPath}:`, error);
  }

  return pages;
}

/**
 * Détecte toutes les pages du projet
 */
async function detectAllPages() {
  const rootDir = path.resolve(__dirname, '..');
  const allPages = [];

  console.log('🔍 Scan des dossiers en cours...\n');

  for (const scanPath of PATHS_TO_SCAN) {
    const fullPath = path.join(rootDir, scanPath);
    console.log(`   → Scan de ${scanPath}...`);

    try {
      const pages = await scanDirectory(fullPath, rootDir);
      allPages.push(...pages);
      console.log(`      ✓ ${pages.length} fichiers trouvés`);
    } catch (error) {
      console.error(`      ✗ Erreur: ${error}`);
    }
  }

  console.log(`\n✅ Total: ${allPages.length} pages détectées\n`);

  return allPages;
}

/**
 * Répartit les pages en groupes équitables
 */
function distributePages(pages, numberOfGroups) {
  const totalPages = pages.length;
  const pagesPerGroup = Math.ceil(totalPages / numberOfGroups);
  const groups = [];

  console.log('📊 Répartition en cours...\n');
  console.log(`   • Total de pages: ${totalPages}`);
  console.log(`   • Nombre de groupes: ${numberOfGroups}`);
  console.log(`   • Pages par groupe: ~${pagesPerGroup}\n`);

  // Trier les pages alphabétiquement pour une répartition déterministe
  const sortedPages = [...pages].sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  for (let i = 0; i < numberOfGroups; i++) {
    const startIdx = i * pagesPerGroup;
    const endIdx = Math.min(startIdx + pagesPerGroup, totalPages);
    const groupPages = sortedPages.slice(startIdx, endIdx);

    groups.push({
      groupId: i + 1,
      groupName: `Groupe ${i + 1}`,
      pagesCount: groupPages.length,
      pages: groupPages,
    });

    console.log(`   ✓ Groupe ${i + 1}: ${groupPages.length} pages (index ${startIdx}-${endIdx - 1})`);
  }

  console.log('');
  return groups;
}

/**
 * Génère le rapport de répartition
 */
function generateDistributionReport(pages, groups) {
  const frontendPages = pages.filter(p => p.category === 'frontend').length;
  const backendPages = pages.filter(p => p.category === 'backend').length;
  const functionsPages = pages.filter(p => p.category === 'functions').length;

  return {
    metadata: {
      totalPages: pages.length,
      numberOfGroups: groups.length,
      averagePagesPerGroup: Math.ceil(pages.length / groups.length),
      generatedAt: new Date().toISOString(),
      scanPaths: PATHS_TO_SCAN,
    },
    groups,
    summary: {
      frontendPages,
      backendPages,
      functionsPages,
    },
  };
}

/**
 * Vérifie la cohérence de la répartition
 */
function verifyDistribution(pages, groups) {
  const errors = [];
  const allGroupPages = new Set();

  console.log('🔍 Vérification de la répartition...\n');

  // Vérifier que chaque page apparaît exactement une fois
  for (const group of groups) {
    for (const page of group.pages) {
      if (allGroupPages.has(page.relativePath)) {
        errors.push(`❌ Doublon détecté: ${page.relativePath}`);
      }
      allGroupPages.add(page.relativePath);
    }
  }

  // Vérifier qu'aucune page n'est oubliée
  const totalPagesInGroups = groups.reduce((sum, g) => sum + g.pagesCount, 0);
  if (totalPagesInGroups !== pages.length) {
    errors.push(`❌ Incohérence: ${totalPagesInGroups} pages dans les groupes vs ${pages.length} pages totales`);
  }

  // Vérifier qu'aucune page source n'est manquante
  for (const page of pages) {
    if (!allGroupPages.has(page.relativePath)) {
      errors.push(`❌ Page manquante dans les groupes: ${page.relativePath}`);
    }
  }

  if (errors.length === 0) {
    console.log('   ✅ Aucun doublon détecté');
    console.log('   ✅ Toutes les pages sont incluses');
    console.log('   ✅ Aucune page n\'est oubliée');
    console.log(`   ✅ Total vérifié: ${totalPagesInGroups} pages\n`);
  } else {
    console.log('   ❌ Erreurs détectées:\n');
    errors.forEach(err => console.log(`      ${err}`));
    console.log('');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== FONCTION PRINCIPALE ====================

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RÉPARTITION AUTOMATIQUE DES PAGES EN GROUPES');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Détection de toutes les pages
    const allPages = await detectAllPages();

    if (allPages.length === 0) {
      console.error('❌ Aucune page détectée. Vérifiez les chemins de scan.');
      process.exit(1);
    }

    // 2. Répartition en groupes
    const groups = distributePages(allPages, NUMBER_OF_GROUPS);

    // 3. Génération du rapport
    const report = generateDistributionReport(allPages, groups);

    // 4. Vérification de cohérence
    const verification = verifyDistribution(allPages, groups);

    if (!verification.valid) {
      console.error('❌ La répartition contient des erreurs. Voir ci-dessus.');
      process.exit(1);
    }

    // 5. Sauvegarde du fichier JSON
    const outputPath = path.join(path.resolve(__dirname, '..'), 'pages-analysis-groups.json');
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log('💾 Fichier JSON généré avec succès!\n');
    console.log(`   📁 Chemin: ${outputPath}\n`);

    // 6. Affichage du résumé
    console.log('═══════════════════════════════════════════════════════');
    console.log('  RÉSUMÉ FINAL');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`   📊 Total de pages:       ${report.metadata.totalPages}`);
    console.log(`   📁 Pages frontend:       ${report.summary.frontendPages}`);
    console.log(`   ⚙️  Pages backend:        ${report.summary.backendPages}`);
    console.log(`   🔧 Fonctions serverless: ${report.summary.functionsPages}`);
    console.log(`   📦 Nombre de groupes:    ${report.metadata.numberOfGroups}`);
    console.log(`   📈 Moyenne par groupe:   ${report.metadata.averagePagesPerGroup} pages`);
    console.log('');
    console.log('   ✅ Aucun doublon');
    console.log('   ✅ Aucune page oubliée');
    console.log('   ✅ Répartition complète et équitable\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ RÉPARTITION TERMINÉE AVEC SUCCÈS');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  }
}

// Exécution
main();
