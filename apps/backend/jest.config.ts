import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testTimeout: 60000,
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],
};

export default config; 