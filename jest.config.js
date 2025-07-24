export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testPathIgnorePatterns: ["migrationHelpers.test.ts"],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.app.json'
    }
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
