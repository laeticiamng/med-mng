import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/integrations/supabase/types.ts',
        '**/*.config.{js,ts}',
        'dist/',
      ],
      thresholds: {
        // Objectifs réalistes pour commencer
        lines: 30,
        functions: 30,
        branches: 30,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'virtual:pwa-register/react': path.resolve(__dirname, './src/test/__mocks__/pwa-register-react.ts'),
    },
  },
});
