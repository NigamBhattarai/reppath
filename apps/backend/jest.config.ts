import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleNameMapper: {
        '@reppath/shared': '<rootDir>/../../packages/shared/src/index.ts'
    }
};

export default config;