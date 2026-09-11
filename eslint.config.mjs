import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// ESLint 9 requires a flat config; `next lint` was removed in Next 16.
const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // Pre-existing patterns across the codebase (untyped browser APIs, mount-time
            // state sync, random star fields). Keep them visible without failing lint.
            '@typescript-eslint/no-explicit-any': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/purity': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
        },
    },
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'playwright-report/**',
            'test-results/**',
            'next-env.d.ts',
            // one-off codemod scripts at the repo root
            '*.js',
        ],
    },
];

export default eslintConfig;
