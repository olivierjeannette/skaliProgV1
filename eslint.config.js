/**
 * ESLint Configuration (v9+)
 * Flat config format for ESLint v9.0.0+
 */

const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const jsdocPlugin = require('eslint-plugin-jsdoc');
const securityPlugin = require('eslint-plugin-security');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
    // ESLint recommended rules
    js.configs.recommended,

    // Prettier config (disables conflicting rules)
    prettierConfig,

    // Main configuration
    {
        files: ['**/*.js'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                prompt: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',

                // Node.js globals
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                Buffer: 'readonly',

                // Skali Prog globals
                ViewManager: 'readonly',
                SyncManager: 'readonly',
                BackupManager: 'readonly',
                PermissionManager: 'readonly',
                SupabaseManager: 'readonly',
                DiscordNotifier: 'readonly',
                Chart: 'readonly',
                jsPDF: 'readonly',
                Auth: 'readonly',
                CONFIG: 'readonly',
                ENV: 'readonly',
                Utils: 'readonly'
            }
        },

        plugins: {
            import: importPlugin,
            jsdoc: jsdocPlugin,
            security: securityPlugin,
            prettier: prettierPlugin
        },

        rules: {
            // Critical errors
            'no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_'
                }
            ],
            'no-undef': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-alert': 'warn',

            // Best practices
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-return-assign': 'error',
            'no-self-compare': 'error',
            'no-throw-literal': 'error',
            'prefer-promise-reject-errors': 'error',

            // Variables
            'no-shadow': 'warn',
            'no-use-before-define': [
                'error',
                {
                    functions: false,
                    classes: true,
                    variables: true
                }
            ],

            // Style (warnings to not block)
            indent: ['warn', 4, { SwitchCase: 1 }],
            quotes: ['warn', 'single', { avoidEscape: true }],
            semi: ['warn', 'always'],
            'comma-dangle': ['warn', 'never'],
            'no-trailing-spaces': 'warn',
            'eol-last': ['warn', 'always'],

            // Imports
            'import/no-unresolved': 'off',
            'import/named': 'off',
            'import/no-duplicates': 'warn',

            // JSDoc
            'jsdoc/check-alignment': 'warn',
            'jsdoc/check-param-names': 'warn',
            'jsdoc/check-tag-names': 'warn',
            'jsdoc/check-types': 'warn',
            'jsdoc/require-description': 'off',
            'jsdoc/require-param': 'warn',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-param-type': 'warn',
            'jsdoc/require-returns': 'warn',
            'jsdoc/require-returns-description': 'off',
            'jsdoc/require-returns-type': 'warn',

            // Security
            'security/detect-eval-with-expression': 'error',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-unsafe-regex': 'error',
            'security/detect-buffer-noassert': 'error',
            'security/detect-child-process': 'warn',
            'security/detect-disable-mustache-escape': 'error',
            'security/detect-no-csrf-before-method-override': 'error',
            'security/detect-non-literal-regexp': 'warn',
            'security/detect-non-literal-require': 'warn',
            'security/detect-object-injection': 'off',
            'security/detect-possible-timing-attacks': 'warn',
            'security/detect-pseudoRandomBytes': 'warn',

            // Prettier
            'prettier/prettier': 'warn'
        }
    },

    // Ignore patterns
    {
        ignores: [
            'node_modules/',
            'temp/',
            'archive/',
            '_archive/',
            '**/*-backup.*',
            '**/*-old.*',
            '**/*-copy.*',
            'dist/',
            'build/',
            'js/lib/',
            '**/*.bundle.js',
            '**/*.min.js',
            '.vscode/',
            '.claude/'
        ]
    }
];
