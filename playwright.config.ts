import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tests E2E MED-MNG
 * Couvre extraction, génération musicale, auth, API
 */
export default defineConfig({
  // Répertoire des tests
  testDir: './tests/e2e',
  
  // Délai global pour tests E2E (certains peuvent être longs)
  timeout: 300000, // 5 minutes pour extraction batch
  
  // Tests en parallèle
  fullyParallel: true,
  
  // Pas de retry en mode CI pour éviter faux positifs
  retries: process.env.CI ? 1 : 0,
  
  // Workers en parallèle
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter pour CI/CD
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Options globales
  use: {
    // URL de base - adaptation selon environnement
    baseURL: process.env.E2E_BASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co',
    
    // Headers pour auth Supabase
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'}`,
      'apikey': process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    
    // Retry automatique pour requêtes réseau instables
    actionTimeout: 30000,
    navigationTimeout: 60000,
    
    // Traces pour debug en cas d'échec
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  // Projets de test selon environnements
  projects: [
    {
      name: 'e2e-api',
      testMatch: '**/api/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'e2e-extraction',
      testMatch: '**/extraction/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'e2e-music',
      testMatch: '**/music/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'e2e-auth',
      testMatch: '**/auth/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // Serveur web pour tests locaux (optionnel)
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});