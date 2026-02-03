#!/usr/bin/env node

/**
 * ESLINT SETUP
 *
 * Configure automatiquement ESLint pour le projet Skali Prog
 *
 * Usage: node scripts/utilities/setup-eslint.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log('\n🔧 Configuration ESLint pour Skali Prog\n');

// ==================== INSTALL PACKAGES ====================

console.log('📦 Installation des packages npm...');

const packages = [
    'eslint',
    'eslint-plugin-import',
    'eslint-plugin-jsdoc',
    'eslint-plugin-security'
];

try {
    execSync(`npm install --save-dev ${packages.join(' ')}`, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    console.log('✅ Packages installés\n');
} catch (error) {
    console.error('❌ Erreur installation packages');
    process.exit(1);
}

// ==================== CREATE .eslintrc.json ====================

console.log('📝 Création .eslintrc.json...');

const eslintConfig = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['import', 'jsdoc', 'security'],
    rules: {
        // Errors critiques
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

        // Bonnes pratiques
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

        // Style (warnings pour ne pas bloquer)
        indent: ['warn', 4, { SwitchCase: 1 }],
        quotes: ['warn', 'single', { avoidEscape: true }],
        semi: ['warn', 'always'],
        'comma-dangle': ['warn', 'never'],
        'no-trailing-spaces': 'warn',
        'eol-last': ['warn', 'always'],

        // Imports
        'import/no-unresolved': 'off', // Trop strict pour vanilla JS
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

        // Sécurité
        'security/detect-eval-with-expression': 'error',
        'security/detect-non-literal-fs-filename': 'warn',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'warn',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-non-literal-require': 'warn',
        'security/detect-object-injection': 'off', // Trop de faux positifs
        'security/detect-possible-timing-attacks': 'warn',
        'security/detect-pseudoRandomBytes': 'warn'
    },
    globals: {
        // Globals Skali Prog
        ViewManager: 'readonly',
        SyncManager: 'readonly',
        BackupManager: 'readonly',
        PermissionManager: 'readonly',
        SupabaseManager: 'readonly',
        DiscordNotifier: 'readonly',
        Chart: 'readonly',
        jsPDF: 'readonly'
    },
    ignorePatterns: [
        'node_modules/',
        'temp/',
        'archive/',
        '_archive/',
        '**/*-backup.*',
        '**/*-old.*',
        '**/*-copy.*',
        'dist/',
        'build/'
    ]
};

fs.writeFileSync(path.join(PROJECT_ROOT, '.eslintrc.json'), JSON.stringify(eslintConfig, null, 2));

console.log('✅ .eslintrc.json créé\n');

// ==================== CREATE .eslintignore ====================

console.log('📝 Création .eslintignore...');

const eslintIgnore = `# Dependencies
node_modules/
vendor/

# Build
dist/
build/
*.min.js

# Temp & Archives
temp/
archive/
_archive/
**/*-backup.*
**/*-old.*
**/*-copy.*

# External libraries
js/lib/
**/*.bundle.js

# Config
.vscode/
.claude/
`;

fs.writeFileSync(path.join(PROJECT_ROOT, '.eslintignore'), eslintIgnore);

console.log('✅ .eslintignore créé\n');

// ==================== ADD NPM SCRIPTS ====================

console.log('📝 Ajout scripts NPM...');

const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
let packageJson;

if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
} else {
    packageJson = {
        name: 'skaliprog',
        version: '2.4.0',
        description: 'Skali Prog - Performance Training System',
        private: true
    };
}

packageJson.scripts = {
    ...packageJson.scripts,
    lint: 'eslint js/**/*.js scripts/**/*.js',
    'lint:fix': 'eslint js/**/*.js scripts/**/*.js --fix',
    'lint:report': 'eslint js/**/*.js scripts/**/*.js -f html -o temp/eslint-report.html'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Scripts NPM ajoutés\n');

// ==================== CREATE VS CODE SETTINGS ====================

console.log('📝 Configuration VS Code...');

const vscodeDir = path.join(PROJECT_ROOT, '.vscode');
if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
}

const vscodeSettings = {
    'eslint.enable': true,
    'eslint.validate': ['javascript'],
    'eslint.run': 'onType',
    'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
    },
    'eslint.workingDirectories': [{ mode: 'auto' }]
};

const settingsPath = path.join(vscodeDir, 'settings.json');
let existingSettings = {};

if (fs.existsSync(settingsPath)) {
    existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
}

const mergedSettings = { ...existingSettings, ...vscodeSettings };

fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 4));

console.log('✅ VS Code configuré\n');

// ==================== RUN FIRST LINT ====================

console.log('🔍 Exécution du premier lint...\n');

try {
    execSync('npm run lint', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    console.log('\n✅ Lint réussi!\n');
} catch (error) {
    console.log('\n⚠️  Erreurs ESLint détectées (normal pour la première fois)\n');
    console.log('💡 Exécuter "npm run lint:fix" pour corriger automatiquement\n');
}

// ==================== SUMMARY ====================

console.log('='.repeat(60));
console.log('✅ ESLINT CONFIGURÉ AVEC SUCCÈS');
console.log('='.repeat(60));
console.log('\n📋 Commandes disponibles:');
console.log('   npm run lint           - Vérifier le code');
console.log('   npm run lint:fix       - Corriger automatiquement');
console.log('   npm run lint:report    - Générer rapport HTML');
console.log('\n🎯 Prochaines étapes:');
console.log('   1. Exécuter: npm run lint:fix');
console.log('   2. Corriger manuellement les erreurs restantes');
console.log('   3. Configurer Prettier: node scripts/utilities/setup-prettier.js');
console.log('   4. Configurer Jest: node scripts/utilities/setup-jest.js\n');
