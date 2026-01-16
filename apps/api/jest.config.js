module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
    collectCoverageFrom: [
        '**/*.ts',
        '!**/*.spec.ts',
        '!**/*.e2e.spec.ts',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/coverage/**',
        '!**/*.module.ts',
        '!**/main.ts',
        '!**/test-*.ts',
        '!**/manual-test.ts',
    ],
    coverageDirectory: '../coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1',
    },
};
