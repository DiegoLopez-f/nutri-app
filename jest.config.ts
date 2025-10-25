import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // ✅ CORRECTO
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;