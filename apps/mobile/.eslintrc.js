module.exports = {
    extends: ['expo', 'prettier'],
    plugins: ['react-hooks'],
    rules: {
        // React Hook Rules - CRITICAL for preventing hook errors
        'react-hooks/rules-of-hooks': 'error', // Enforce Rules of Hooks
        'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
            },
        },
    ],
};
