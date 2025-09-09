#!/usr/bin/env node

/**
 * Script de nettoyage des TODO/FIXME/HACK
 * Convertit les TODO en tâches trackées et nettoie le code
 */

const fs = require('fs');
const path = require('path');

// TODO trouvés dans le projet à traiter
const todos = [
  {
    file: 'src/components/edn/EdnRecommendations.tsx',
    line: 173,
    text: 'TODO: Implement favorites',
    priority: 'medium',
    action: 'create_task'
  },
  {
    file: 'src/services/core/ErrorService.ts', 
    line: 85,
    text: 'TODO: Envoyer au service de monitoring en production',
    priority: 'high',
    action: 'create_task'
  },
  {
    file: 'src/services/core/ErrorService.ts',
    line: 299, 
    text: 'TODO: Intégrer avec le système de toast de l\'app',
    priority: 'high',
    action: 'create_task'
  }
];

// Génération du fichier de tâches
const tasks = todos.map((todo, index) => ({
  id: `TODO-${index + 1}`,
  title: todo.text.replace('TODO: ', ''),
  description: `Issu du fichier ${todo.file} ligne ${todo.line}`,
  priority: todo.priority,
  status: 'open',
  created: new Date().toISOString(),
  file: todo.file,
  line: todo.line
}));

// Sauvegarde des tâches
fs.writeFileSync('TODO-TASKS.json', JSON.stringify(tasks, null, 2));

console.log(`✅ ${tasks.length} tâches créées dans TODO-TASKS.json`);
console.log('📋 Prochaine étape : importer ces tâches dans votre outil de suivi');

// Nettoyage des TODO simples dans les stories (autodocs)
const storyFiles = [
  'src/stories/Accessible.stories.tsx',
  'src/stories/AdminDashboard.stories.tsx', 
  'src/stories/AlertBanner.stories.tsx',
  'src/stories/Button.stories.tsx',
  'src/stories/Card.stories.tsx',
  'src/stories/GeneratorMusicPlayer.stories.tsx',
  'src/stories/LoadingSpinner.stories.tsx',
  'src/stories/MobileBottomNav.stories.tsx',
  'src/stories/NotificationCenter.stories.tsx',
  'src/stories/RobustErrorDisplay.stories.tsx',
  'src/stories/SecurityDashboard.stories.tsx',
  'src/stories/Skeletons.stories.tsx'
];

let cleanedFiles = 0;
storyFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Les 'autodocs' dans les stories ne sont pas des TODO à traiter
    // Ils font partie de la config Storybook normale
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      cleanedFiles++;
    }
  } catch (error) {
    console.warn(`⚠️  Impossible de traiter ${file}: ${error.message}`);
  }
});

console.log(`🧹 ${cleanedFiles} fichiers nettoyés`);
console.log('✨ Nettoyage TODO terminé !');