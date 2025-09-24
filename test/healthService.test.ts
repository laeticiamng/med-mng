import { getBuildInfo, getHealthMessage, getHealthStatus } from '../src/services/healthService';

test('returns default health message', () => {
  expect(getHealthMessage()).toBe('Med-MNG API running');
});

test('health status exposes build metadata', () => {
  const status = getHealthStatus();
  expect(status.build.hash).toBeTruthy();
  expect(status.build.timestamp).toBeTruthy();
  expect(status.build.version).toBeTruthy();
});

test('build info helper mirrors health status build data', () => {
  const buildInfo = getBuildInfo();
  expect(buildInfo).toMatchObject({
    hash: expect.any(String),
    timestamp: expect.any(String),
    version: expect.any(String),
  });
});
