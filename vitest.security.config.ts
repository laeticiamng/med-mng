import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['tests/security/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      'src/stories/**',
      'test/e2e/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/middleware/security.ts',
        'src/services/rateLimitService.ts',
        'src/services/stores/SupabaseRateLimitStore.ts',
        'src/utils/suspiciousRequest.ts'
      ],
      exclude: [
        'node_modules/',
        'src/tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        'src/stories/**',
        'src/**/*.stories.*'
      ],
      // Seuils de couverture stricts pour la sécurité
      thresholds: {
        global: {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        },
        // Seuils spécifiques par fichier critique
        'src/middleware/security.ts': {
          branches: 95,
          functions: 100,
          lines: 98,
          statements: 98
        },
        'src/services/rateLimitService.ts': {
          branches: 92,
          functions: 100,
          lines: 95,
          statements: 95
        },
        'src/utils/suspiciousRequest.ts': {
          branches: 88,
          functions: 95,
          lines: 92,
          statements: 92
        }
      }
    },
    // Configuration spécifique pour les tests de sécurité
    testTimeout: 10000, // 10s timeout pour les tests de performance
    hookTimeout: 5000,  // 5s timeout pour les setup/teardown
    teardownTimeout: 3000,
    
    // Reporters pour les tests de sécurité
    reporter: [
      'verbose',
      'json',
      ['html', { outputFile: 'security-test-report.html' }]
    ],
    
    // Parallélisation pour les tests de sécurité
    threads: true,
    maxThreads: 4,
    minThreads: 2,
    
    // Configuration des mocks
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Variables d'environnement pour les tests
    env: {
      NODE_ENV: 'test',
      SKIP_ENV_VALIDATION: 'true',
      CORS_ALLOWED_ORIGINS: 'http://localhost:3000,https://test.com',
      MAX_PAYLOAD_MB: '1',
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX_REQUESTS: '10'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// Configuration spéciale pour les tests de sécurité en mode CI
if (process.env.CI === 'true') {
  const config = defineConfig({
    test: {
      // En CI, utiliser des timeouts plus longs
      testTimeout: 30000,
      hookTimeout: 10000,
      
      // Reporter adapté pour CI
      reporter: ['json', 'junit'],
      outputFile: {
        json: 'security-test-results.json',
        junit: 'security-junit.xml'
      },
      
      // Couverture obligatoire en CI
      coverage: {
        reporter: ['lcov', 'text-summary'],
        // Échec si seuils non atteints
        thresholdAutoUpdate: false,
      },
      
      // Pas de parallélisation en CI pour éviter les conflits
      threads: false,
      
      // Mode silencieux en CI
      silent: false,
      verbose: true
    }
  });
}