import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');
  
  // Vérifier que le serveur de développement est disponible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Application is ready for testing');
  } catch (error) {
    console.error('❌ Application not ready:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Setup test data if needed
  console.log('📊 Setting up test data...');
  
  // Vous pouvez ajouter ici la création de données de test
  // par exemple via des appels API ou des scripts de base de données
  
  console.log('✅ Global setup completed');
}

export default globalSetup;