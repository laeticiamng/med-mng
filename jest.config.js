export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testPathIgnorePatterns: ["migrationHelpers.test.ts"],
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
