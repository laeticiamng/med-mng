import { test, expect } from 'vitest';
import { MigrationHelpers } from '../src/utils/migrationHelpers';

// Ancien test écrit pour node:test (jamais collecté par vitest) : porté tel quel sur vitest.
test('canMigrateSafely identifies missing fields', () => {
  const result = MigrationHelpers.canMigrateSafely({});
  expect(result.canMigrate).toBe(false);
  expect(result.warnings.length).toBeGreaterThan(0);
});
