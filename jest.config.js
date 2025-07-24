export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  setupFiles: ['<rootDir>/test/testSetup.ts'],
  testPathIgnorePatterns: ["migrationHelpers.test.ts"],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.app.json'
    }
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
