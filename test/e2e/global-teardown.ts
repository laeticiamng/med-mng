import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test cleanup...');
  
  // Nettoyer les données de test
  console.log('🗑️ Cleaning up test data...');
  
  // Vous pouvez ajouter ici le nettoyage des données de test
  // par exemple suppression de données créées pendant les tests
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;