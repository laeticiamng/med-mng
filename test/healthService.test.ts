import { getHealthMessage } from '../src/services/healthService';

test('returns default health message', () => {
  expect(getHealthMessage()).toBe('Med-MNG API running');
});
