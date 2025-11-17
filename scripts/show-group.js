#!/usr/bin/env node
/**
 * Script pour afficher les détails d'un groupe spécifique
 *
 * Usage: node scripts/show-group.js <numéro-de-groupe>
 * Exemple: node scripts/show-group.js 1
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const groupNumber = parseInt(process.argv[2]);

  if (!groupNumber || groupNumber < 1) {
    console.error('❌ Usage: node scripts/show-group.js <numéro-de-groupe>');
    console.error('   Exemple: node scripts/show-group.js 1');
    process.exit(1);
  }

  try {
    // Lire le fichier JSON
    const jsonPath = path.join(path.resolve(__dirname, '..'), 'pages-analysis-groups.json');
    const data = await fs.readFile(jsonPath, 'utf-8');
    const distribution = JSON.parse(data);

    // Trouver le groupe
    const group = distribution.groups.find(g => g.groupId === groupNumber);

    if (!group) {
      console.error(`❌ Groupe ${groupNumber} introuvable.`);
      console.error(`   Groupes disponibles: 1-${distribution.metadata.numberOfGroups}`);
      process.exit(1);
    }

    // Afficher les détails
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  ${group.groupName.toUpperCase()}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`📊 Nombre de pages: ${group.pagesCount}`);
    console.log('');

    // Compter par catégorie
    const byCategory = {
      frontend: group.pages.filter(p => p.category === 'frontend').length,
      backend: group.pages.filter(p => p.category === 'backend').length,
      functions: group.pages.filter(p => p.category === 'functions').length,
    };

    console.log('📁 Répartition par catégorie:');
    console.log(`   • Frontend:  ${byCategory.frontend} pages`);
    console.log(`   • Backend:   ${byCategory.backend} pages`);
    console.log(`   • Functions: ${byCategory.functions} pages`);
    console.log('');

    console.log('📄 Liste des pages:\n');

    // Grouper par catégorie pour l'affichage
    const categories = ['backend', 'frontend', 'functions'];

    for (const category of categories) {
      const pagesInCategory = group.pages.filter(p => p.category === category);

      if (pagesInCategory.length === 0) continue;

      console.log(`\n${getCategoryIcon(category)} ${category.toUpperCase()} (${pagesInCategory.length} pages):`);
      console.log('─'.repeat(60));

      pagesInCategory.forEach((page, idx) => {
        console.log(`${(idx + 1).toString().padStart(3, ' ')}. ${page.relativePath}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    // Option: Exporter la liste des fichiers pour utilisation avec d'autres outils
    if (process.argv.includes('--paths-only')) {
      console.log('\nChemin des fichiers (pour copier-coller):');
      console.log('─'.repeat(60));
      group.pages.forEach(page => {
        console.log(page.relativePath);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

function getCategoryIcon(category) {
  const icons = {
    frontend: '📱',
    backend: '⚙️',
    functions: '🔧',
  };
  return icons[category] || '📄';
}

main();
