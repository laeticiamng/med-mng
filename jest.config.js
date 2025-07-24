export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  setupFiles: ['<rootDir>/test/testSetup.ts'],
  testPathIgnorePatterns: ["migrationHelpers.test.ts"],
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
