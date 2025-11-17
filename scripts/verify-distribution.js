#!/usr/bin/env node
/**
 * Script de vérification de la répartition
 *
 * Vérifie :
 * - Aucun doublon
 * - Aucune page oubliée
 * - Répartition équitable
 * - Statistiques détaillées
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    // Lire le fichier JSON
    const jsonPath = path.join(path.resolve(__dirname, '..'), 'pages-analysis-groups.json');
    const data = await fs.readFile(jsonPath, 'utf-8');
    const distribution = JSON.parse(data);

    console.log('═══════════════════════════════════════════════════════');
    console.log('  VÉRIFICATION DE LA RÉPARTITION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Vérification 1: Pas de doublons
    console.log('🔍 Vérification 1: Détection de doublons...');
    const allPaths = new Set();
    const duplicates = [];

    for (const group of distribution.groups) {
      for (const page of group.pages) {
        if (allPaths.has(page.relativePath)) {
          duplicates.push(page.relativePath);
        }
        allPaths.add(page.relativePath);
      }
    }

    if (duplicates.length > 0) {
      console.log(`   ❌ ${duplicates.length} doublons trouvés:`);
      duplicates.forEach(d => console.log(`      - ${d}`));
    } else {
      console.log('   ✅ Aucun doublon détecté\n');
    }

    // Vérification 2: Cohérence du nombre total
    console.log('🔍 Vérification 2: Cohérence du total...');
    const totalInGroups = distribution.groups.reduce((sum, g) => sum + g.pagesCount, 0);

    if (totalInGroups !== distribution.metadata.totalPages) {
      console.log(`   ❌ Incohérence: ${totalInGroups} pages dans groupes vs ${distribution.metadata.totalPages} dans métadonnées`);
    } else {
      console.log(`   ✅ Total cohérent: ${totalInGroups} pages\n`);
    }

    // Vérification 3: Répartition équitable
    console.log('🔍 Vérification 3: Équité de la répartition...');
    const pageCounts = distribution.groups.map(g => g.pagesCount);
    const minPages = Math.min(...pageCounts);
    const maxPages = Math.max(...pageCounts);
    const diff = maxPages - minPages;

    console.log(`   • Min: ${minPages} pages`);
    console.log(`   • Max: ${maxPages} pages`);
    console.log(`   • Différence: ${diff} pages`);

    if (diff <= 2) {
      console.log('   ✅ Répartition équitable\n');
    } else {
      console.log('   ⚠️  Répartition déséquilibrée\n');
    }

    // Statistiques détaillées
    console.log('═══════════════════════════════════════════════════════');
    console.log('  STATISTIQUES DÉTAILLÉES');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Métadonnées:');
    console.log(`   • Total de pages:      ${distribution.metadata.totalPages}`);
    console.log(`   • Nombre de groupes:   ${distribution.metadata.numberOfGroups}`);
    console.log(`   • Moyenne par groupe:  ${distribution.metadata.averagePagesPerGroup}`);
    console.log(`   • Date de génération:  ${new Date(distribution.metadata.generatedAt).toLocaleString('fr-FR')}`);
    console.log('');

    console.log('📁 Répartition par catégorie:');
    console.log(`   • Frontend:  ${distribution.summary.frontendPages} pages (${(distribution.summary.frontendPages / distribution.metadata.totalPages * 100).toFixed(1)}%)`);
    console.log(`   • Backend:   ${distribution.summary.backendPages} pages (${(distribution.summary.backendPages / distribution.metadata.totalPages * 100).toFixed(1)}%)`);
    console.log(`   • Functions: ${distribution.summary.functionsPages} pages (${(distribution.summary.functionsPages / distribution.metadata.totalPages * 100).toFixed(1)}%)`);
    console.log('');

    console.log('📦 Détails des groupes:');
    console.log('');

    // Table des groupes
    console.log('┌─────────┬───────┬──────────┬─────────┬───────────┐');
    console.log('│ Groupe  │ Pages │ Frontend │ Backend │ Functions │');
    console.log('├─────────┼───────┼──────────┼─────────┼───────────┤');

    for (const group of distribution.groups) {
      const frontend = group.pages.filter(p => p.category === 'frontend').length;
      const backend = group.pages.filter(p => p.category === 'backend').length;
      const functions = group.pages.filter(p => p.category === 'functions').length;

      console.log(
        `│ ${group.groupName.padEnd(7)} │ ${group.pagesCount.toString().padStart(5)} │ ${frontend.toString().padStart(8)} │ ${backend.toString().padStart(7)} │ ${functions.toString().padStart(9)} │`
      );
    }

    console.log('└─────────┴───────┴──────────┴─────────┴───────────┘');
    console.log('');

    // Recommandations
    console.log('═══════════════════════════════════════════════════════');
    console.log('  RECOMMANDATIONS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (duplicates.length === 0 && totalInGroups === distribution.metadata.totalPages && diff <= 2) {
      console.log('✅ La répartition est parfaite!');
      console.log('   Vous pouvez procéder à l\'analyse des groupes.\n');
    } else {
      console.log('⚠️  Problèmes détectés:');
      if (duplicates.length > 0) {
        console.log(`   • Régénérer la répartition pour éliminer les ${duplicates.length} doublons`);
      }
      if (totalInGroups !== distribution.metadata.totalPages) {
        console.log('   • Régénérer la répartition pour corriger l\'incohérence du total');
      }
      if (diff > 2) {
        console.log('   • Envisager d\'ajuster le nombre de groupes pour une meilleure équité');
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.code === 'ENOENT') {
      console.error('\n💡 Le fichier pages-analysis-groups.json n\'existe pas.');
      console.error('   Générez-le avec: node scripts/distribute-pages-analysis.js\n');
    }

    process.exit(1);
  }
}

main();
