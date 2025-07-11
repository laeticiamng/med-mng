import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MigrationHelpers } from '../src/utils/migrationHelpers';

test('canMigrateSafely identifies missing fields', () => {
  const result = MigrationHelpers.canMigrateSafely({});
  assert.equal(result.canMigrate, false);
  assert.ok(result.warnings.length > 0);
});
