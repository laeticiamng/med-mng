/**
 * Script de nettoyage de l'architecture - Réorganise les fichiers selon les bonnes pratiques
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// Structure recommandée pour les scripts et documentation
const RECOMMENDED_STRUCTURE = {
  'scripts/': {
    description: 'Scripts d\'automatisation et de maintenance',
    files: [
      'clean-architecture.js',
      'extract-oic-*.ts',
      'generateAllLyrics.ts',
      'run-extraction.js',
      'test-*.js'
    ]
  },
  'docs/': {
    description: 'Documentation technique et guides',
    files: [
      'ENVIRONMENT-VARIABLES.md',
      'TICKET_*.md',
      'README-*.md',
      'security/',
      'api/'
    ]
  },
  'tools/': {
    description: 'Outils de développement et utilitaires',
    files: [
      'audit-*.js',
      'security-scan.js',
      'performance-check.js'
    ]
  }
};

// Fichiers à nettoyer (déplacer vers les bons dossiers)
const FILES_TO_ORGANIZE = [
  // Scripts de test au niveau racine
  { from: 'test-cas-auth.ts', to: 'scripts/test-cas-auth.ts' },
  { from: 'test-oic-api.ts', to: 'scripts/test-oic-api.ts' },
  { from: 'run-extraction.js', to: 'scripts/run-extraction.js' },
  { from: 'extract-oic-deno.ts', to: 'scripts/extract-oic-deno.ts' },
  
  // Documentation dispersée
  { from: 'AUDIT-RAPPORT-FINAL.md', to: 'docs/security/audit-rapport-final.md' },
  { from: 'RAPPORT-AUDIT-SECURITE.md', to: 'docs/security/rapport-audit-securite.md' },
  { from: 'SECURITY-AUDIT-RESULTS.md', to: 'docs/security/security-audit-results.md' },
  
  // Rapports temporaires
  { from: 'RAPPORT-*.md', to: 'docs/reports/' },
  
  // Fichiers de configuration spécifiques
  { from: 'audit-*.json', to: 'tools/audit-configs/' }
];

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Créé le dossier: ${dirPath}`);
  }
}

function moveFile(fromPath, toPath) {
  const absoluteFrom = path.join(PROJECT_ROOT, fromPath);
  const absoluteTo = path.join(PROJECT_ROOT, toPath);
  
  if (fs.existsSync(absoluteFrom)) {
    // S'assurer que le dossier de destination existe
    ensureDirectoryExists(path.dirname(absoluteTo));
    
    try {
      fs.renameSync(absoluteFrom, absoluteTo);
      console.log(`📦 Déplacé: ${fromPath} → ${toPath}`);
    } catch (error) {
      console.warn(`⚠️ Impossible de déplacer ${fromPath}: ${error.message}`);
    }
  }
}

function createReadmeForDirectory(dirPath, description) {
  const readmePath = path.join(PROJECT_ROOT, dirPath, 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    const content = `# ${path.basename(dirPath)}

${description}

## Contenu de ce dossier

${description.toLowerCase().includes('script') 
  ? '- Scripts d\'automatisation et de maintenance\n- Outils d\'extraction et de traitement de données\n- Scripts de test et de validation'
  : description.toLowerCase().includes('doc')
  ? '- Documentation technique du projet\n- Guides de configuration et de déploiement\n- Rapports d\'audit et de sécurité'
  : '- Utilitaires de développement\n- Outils d\'analyse et de monitoring\n- Scripts de configuration'
}

## Structure recommandée

Organisez les fichiers selon leur fonction:
- **Configuration**: Fichiers de config et paramètres
- **Exécution**: Scripts exécutables et automations
- **Documentation**: README, guides et rapports
- **Tests**: Scripts de test et validation

## Sécurité

⚠️ **Important**: Aucun secret ou credential ne doit être committé dans ce dossier.
Utilisez les variables d'environnement et les secrets Supabase pour les données sensibles.

---
*Généré automatiquement par clean-architecture.js*
`;
    
    fs.writeFileSync(readmePath, content);
    console.log(`📝 Créé README.md dans ${dirPath}`);
  }
}

function cleanupRootDirectory() {
  console.log('🧹 Nettoyage de l\'architecture du projet...\n');
  
  // 1. Créer la structure de dossiers recommandée
  Object.entries(RECOMMENDED_STRUCTURE).forEach(([dir, config]) => {
    ensureDirectoryExists(path.join(PROJECT_ROOT, dir));
    createReadmeForDirectory(dir, config.description);
  });
  
  // 2. Déplacer les fichiers selon les règles définies
  FILES_TO_ORGANIZE.forEach(({ from, to }) => {
    // Support des patterns avec *
    if (from.includes('*')) {
      const pattern = from.replace('*', '');
      const files = fs.readdirSync(PROJECT_ROOT)
        .filter(file => file.startsWith(pattern.split('*')[0]) && file.endsWith(pattern.split('*')[1]));
      
      files.forEach(file => {
        const targetFile = to.includes('*') ? to.replace('*', file.replace(pattern.replace('*', ''), '')) : path.join(to, file);
        moveFile(file, targetFile);
      });
    } else {
      moveFile(from, to);
    }
  });
  
  // 3. Créer un index des scripts
  createScriptsIndex();
  
  console.log('\n✅ Nettoyage terminé avec succès !');
  console.log('\n📋 Structure recommandée:');
  Object.entries(RECOMMENDED_STRUCTURE).forEach(([dir, config]) => {
    console.log(`  ${dir} - ${config.description}`);
  });
}

function createScriptsIndex() {
  const scriptsDir = path.join(PROJECT_ROOT, 'scripts');
  const indexPath = path.join(scriptsDir, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    const content = `/**
 * Index des scripts disponibles
 * Exécuter: node scripts/index.js [nom-du-script]
 */

const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS = {
  'clean': {
    file: 'clean-architecture.js',
    description: 'Nettoie et réorganise l\'architecture du projet'
  },
  'extract-oic': {
    file: 'extract-oic-deno.ts',
    description: 'Extraction des données OIC depuis UNESS'
  },
  'test-cas': {
    file: 'test-cas-auth.ts',
    description: 'Test d\'authentification CAS'
  }
};

function showHelp() {
  console.log('🚀 Scripts disponibles:\\n');
  Object.entries(SCRIPTS).forEach(([name, config]) => {
    console.log(\`  \${name.padEnd(15)} - \${config.description}\`);
  });
  console.log('\\nUsage: node scripts/index.js [script-name]');
}

function runScript(scriptName) {
  const script = SCRIPTS[scriptName];
  if (!script) {
    console.error(\`❌ Script '\${scriptName}' introuvable\`);
    showHelp();
    process.exit(1);
  }
  
  const scriptPath = path.join(__dirname, script.file);
  console.log(\`🔧 Exécution de: \${script.description}\`);
  
  try {
    execSync(\`node \${scriptPath}\`, { stdio: 'inherit' });
  } catch (error) {
    console.error(\`❌ Erreur lors de l'exécution: \${error.message}\`);
    process.exit(1);
  }
}

// Point d'entrée
const scriptName = process.argv[2];
if (!scriptName) {
  showHelp();
} else {
  runScript(scriptName);
}
`;
    
    fs.writeFileSync(indexPath, content);
    console.log('📇 Créé l\'index des scripts: scripts/index.js');
  }
}

// Exécution si appelé directement
if (require.main === module) {
  cleanupRootDirectory();
}

module.exports = { cleanupRootDirectory, RECOMMENDED_STRUCTURE };