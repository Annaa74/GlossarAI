/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest-setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // Don't crawl the bundled Firebase/Expo source — only stub them when imported.
  moduleNameMapper: {
    '^firebase/(.*)$': '<rootDir>/__tests__/__mocks__/firebase-empty.ts',
    '^expo-constants$': '<rootDir>/__tests__/__mocks__/expo-constants.ts',
  },
  collectCoverageFrom: [
    'services/srs.ts',
    'services/growthEngine.ts',
    'stores/growthStore.ts',
    'utils/helpers.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
